import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import auth from '../middleware/auth.js';
import { uploadImage, uploadAudio } from '../middleware/upload.js';
import Grievance from '../models/Grievance.js';
import AiAnalysis from '../models/AiAnalysis.js';
import StatusUpdate from '../models/StatusUpdate.js';
import TrainingData from '../models/TrainingData.js';
import User from '../models/User.js';
import { PORTAL_DATA, RESOLUTION_DAYS } from '../utils/portalData.js';

const router = express.Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://ai-engine:8000';

// ─── POST /api/grievance/ingest ─────────────────────────────────
// Receives text/image/audio from citizen. Saves pending grievance.
// Calls AI engine for processing. Returns verification data.
router.post('/ingest', auth, (req, res) => {
  // Determine upload type from query param or content-type
  const inputType = req.query.type || 'text';

  const handleUpload = (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ message: 'File upload error', error: uploadErr.message });
    }
    processIngest(req, res, inputType);
  };

  if (inputType === 'image') {
    uploadImage(req, res, handleUpload);
  } else if (inputType === 'audio') {
    uploadAudio(req, res, handleUpload);
  } else {
    // Text input — no file upload middleware needed
    processIngest(req, res, 'text');
  }
});

async function processIngest(req, res, inputType) {
  try {
    // 1. Create a pending grievance document
    const grievanceData = {
      user_id: req.user.userId,
      status: 'processing',
      input_type: inputType
    };

    if (inputType === 'image' && req.file) {
      grievanceData.image_url = req.file.path;
    } else if (inputType === 'audio' && req.file) {
      grievanceData.audio_url = req.file.path;
    }

    const grievance = new Grievance(grievanceData);
    await grievance.save();

    // 2. Build FormData and POST to AI engine
    const formData = new FormData();
    formData.append('grievance_id', grievance._id.toString());

    if (inputType === 'text') {
      formData.append('text', req.body.text || '');
      formData.append('input_type', 'text');
    } else if (inputType === 'image' && req.file) {
      formData.append('image', fs.createReadStream(req.file.path));
      formData.append('input_type', 'image');
    } else if (inputType === 'audio' && req.file) {
      formData.append('audio', fs.createReadStream(req.file.path));
      formData.append('input_type', 'audio');
    }

    const aiResponse = await axios.post(
      `${AI_ENGINE_URL}/process-grievance-full`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000 // 60s timeout for AI processing
      }
    );

    const aiData = aiResponse.data;

    // 3. Create AiAnalysis document
    const aiAnalysis = new AiAnalysis({
      grievance_id: grievance._id,
      english_summary: aiData.english_summary || aiData.english_text || '',
      verification_sentence: aiData.verification_sentence || '',
      detected_language: aiData.detected_language || 'en-IN',
      ocr_raw_text: aiData.ocr_raw_text || '',
      stt_transcript: aiData.stt_transcript || '',
      llm_category: aiData.category || '',
      llm_priority: aiData.priority || 'medium',
      keywords: aiData.keywords || [],
      confidence_score: aiData.confidence_score || 0,
      processing_ms: aiData.processing_ms || 0
    });
    await aiAnalysis.save();

    // 4. Update grievance with AI results
    grievance.original_text = aiData.original_text || req.body.text || '';
    grievance.original_language = aiData.detected_language || 'en-IN';
    grievance.category = aiData.category || 'other';
    grievance.priority = aiData.priority || 'medium';
    grievance.title = (aiData.english_summary || aiData.english_text || 'Untitled Grievance').substring(0, 80);
    await grievance.save();

    // 5. Return verification data to frontend
    res.status(200).json({
      grievance_id: grievance._id,
      verification_sentence: aiData.verification_sentence || '',
      detected_language: aiData.detected_language || 'en-IN',
      category: aiData.category || 'other',
      priority: aiData.priority || 'medium',
      keywords: aiData.keywords || [],
      english_summary: aiData.english_summary || aiData.english_text || '',
      confidence_score: aiData.confidence_score || 0
    });
  } catch (error) {
    console.error('❌ Ingest error:', error.message);

    // If AI engine is unreachable, still return the created grievance
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        message: 'AI Engine is not available. Grievance saved as pending.',
        error: 'AI_ENGINE_UNAVAILABLE'
      });
    }

    res.status(500).json({ message: 'Failed to process grievance', error: error.message });
  }
}

// ─── POST /api/grievance/confirm ────────────────────────────────
// Citizen confirms or rejects the AI verification.
router.post('/confirm', auth, async (req, res) => {
  try {
    const { grievance_id, confirmed } = req.body;

    if (!grievance_id) {
      return res.status(400).json({ message: 'grievance_id is required' });
    }

    const grievance = await Grievance.findById(grievance_id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Verify ownership
    if (grievance.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (confirmed === false) {
      // Citizen rejected — reset to pending for re-processing
      grievance.status = 'pending';
      await grievance.save();
      return res.status(200).json({ retry: true, message: 'Grievance reset for reprocessing' });
    }

    // Citizen confirmed
    const oldStatus = grievance.status;
    grievance.status = 'open';
    await grievance.save();

    // Create status audit log
    await StatusUpdate.create({
      grievance_id: grievance._id,
      old_status: oldStatus,
      new_status: 'open',
      changed_by: 'citizen'
    });

    // Fetch AI analysis to create training data
    const aiAnalysis = await AiAnalysis.findOne({ grievance_id: grievance._id });

    if (aiAnalysis) {
      await TrainingData.create({
        original_text: grievance.original_text || '',
        detected_language: aiAnalysis.detected_language || 'en-IN',
        english_text: aiAnalysis.english_summary || '',
        confirmed_category: grievance.category || 'other'
      });
    }

    res.status(200).json({ success: true, grievance_id: grievance._id });
  } catch (error) {
    console.error('❌ Confirm error:', error.message);
    res.status(500).json({ message: 'Failed to confirm grievance', error: error.message });
  }
});

// ─── POST /api/grievance/submit ─────────────────────────────────
// Saves location/contact info. Calls Nominatim. Returns portal suggestions.
router.post('/submit', auth, async (req, res) => {
  try {
    const {
      grievance_id, user_name, user_phone,
      state, district, pincode, address, landmark
    } = req.body;

    if (!grievance_id) {
      return res.status(400).json({ message: 'grievance_id is required' });
    }

    const grievance = await Grievance.findById(grievance_id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Verify ownership
    if (grievance.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Translate address from native language to English via AI engine
    let translatedAddress = address;
    try {
      const translateRes = await axios.post(`${AI_ENGINE_URL}/translate`, {
        text: address,
        target_language: 'en'
      }, { timeout: 15000 });
      translatedAddress = translateRes.data.translated_text || address;
    } catch (translateErr) {
      console.warn('⚠️ Address translation failed, using original:', translateErr.message);
    }

    // Update grievance with location data
    grievance.user_name = user_name;
    grievance.user_phone = user_phone;
    grievance.state = state;
    grievance.district = district;
    grievance.pincode = pincode;
    grievance.address = translatedAddress;
    grievance.landmark = landmark;
    await grievance.save();

    // Call Nominatim API for nearby offices (free, no key needed)
    let nearbyOffices = [];
    try {
      const categoryKeyword = grievance.category || 'government office';
      const searchQuery = `${district} ${categoryKeyword}`;
      const nominatimRes = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 5,
          countrycodes: 'in'
        },
        headers: {
          'User-Agent': 'BhashaFlow/1.0 (NIIT University Capstone Project)'
        },
        timeout: 10000
      });

      nearbyOffices = (nominatimRes.data || []).map(place => ({
        name: place.display_name,
        lat: place.lat,
        lng: place.lon
      }));
    } catch (nominatimErr) {
      console.warn('⚠️ Nominatim lookup failed:', nominatimErr.message);
    }

    // Look up portal data
    const category = grievance.category || 'other';
    const portalInfo = PORTAL_DATA[category]?.[state] || null;

    const responseData = {
      grievance_id: grievance._id,
      nearby_offices: nearbyOffices,
      portal_links: portalInfo ? {
        portal_name: portalInfo.portal_name,
        portal_url: portalInfo.portal_url,
        helpline: portalInfo.helpline
      } : null,
      procedure_steps: portalInfo ? portalInfo.procedure_steps : [],
      expected_resolution_days: RESOLUTION_DAYS[category] || RESOLUTION_DAYS.other
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Submit error:', error.message);
    res.status(500).json({ message: 'Failed to submit grievance details', error: error.message });
  }
});

// ─── GET /api/grievance/my ──────────────────────────────────────
// Returns all grievances for the logged-in user.
router.get('/my', auth, async (req, res) => {
  try {
    const grievances = await Grievance.find({ user_id: req.user.userId })
      .sort({ submitted_at: -1 });

    // Populate with AI analysis summaries
    const grievanceIds = grievances.map(g => g._id);
    const analyses = await AiAnalysis.find({ grievance_id: { $in: grievanceIds } });
    const analysisMap = {};
    analyses.forEach(a => { analysisMap[a.grievance_id.toString()] = a; });

    const result = grievances.map(g => ({
      ...g.toObject(),
      ai_analysis: analysisMap[g._id.toString()] || null
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ My grievances error:', error.message);
    res.status(500).json({ message: 'Failed to fetch grievances', error: error.message });
  }
});

// ─── GET /api/grievance/:id ─────────────────────────────────────
// Returns full detail of one grievance + status timeline.
router.get('/:id', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    const aiAnalysis = await AiAnalysis.findOne({ grievance_id: grievance._id });
    const statusUpdates = await StatusUpdate.find({ grievance_id: grievance._id })
      .sort({ updated_at: 1 });

    res.status(200).json({
      grievance: grievance.toObject(),
      ai_analysis: aiAnalysis || null,
      status_timeline: statusUpdates
    });
  } catch (error) {
    console.error('❌ Grievance detail error:', error.message);
    res.status(500).json({ message: 'Failed to fetch grievance', error: error.message });
  }
});

// ─── GET /api/grievance/:id/audio ───────────────────────────────
// Streams the original audio file back for admin replay.
router.get('/:id/audio', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance || !grievance.audio_url) {
      return res.status(404).json({ message: 'Audio not found' });
    }

    const audioPath = path.resolve(grievance.audio_url);
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ message: 'Audio file missing from server' });
    }

    res.sendFile(audioPath);
  } catch (error) {
    console.error('❌ Audio stream error:', error.message);
    res.status(500).json({ message: 'Failed to stream audio', error: error.message });
  }
});

export default router;
