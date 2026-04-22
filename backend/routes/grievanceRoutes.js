import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import auth from '../middleware/auth.js';
import { uploadCombined } from '../middleware/upload.js';
import Grievance from '../models/Grievance.js';
import AiAnalysis from '../models/AiAnalysis.js';
import StatusUpdate from '../models/StatusUpdate.js';
import TrainingData from '../models/TrainingData.js';
import { getPortalsForCategory } from '../utils/portalData.js';

const router = express.Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://ai-engine:8000';

// ─── POST /api/grievance/ingest ─────────────────────────────────
router.post('/ingest', auth, uploadCombined.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]), (req, res) => {
  let inputType = 'text';
  if (req.files?.['image']) {
    inputType = 'image';
    req.file = req.files['image'][0];
  } else if (req.files?.['audio']) {
    inputType = 'audio';
    req.file = req.files['audio'][0];
  }
  return processIngest(req, res, inputType);
});

async function processIngest(req, res, inputType) {
  try {
    // 1. Create pending grievance
    const grievanceData = {
      user_id:    req.user.userId,
      status:     'processing',
      input_type: inputType,
    };
    if (inputType === 'image' && req.file) grievanceData.image_url = req.file.path;
    if (inputType === 'audio' && req.file) grievanceData.audio_url = req.file.path;

    const grievance = new Grievance(grievanceData);
    await grievance.save();

    // 2. Build FormData for AI engine
    const formData = new FormData();
    formData.append('grievance_id', grievance._id.toString());

    if (inputType === 'text') {
      formData.append('text', req.body.text || '');
    } else if (inputType === 'image' && req.file) {
      formData.append('image', fs.createReadStream(req.file.path), {
        filename:    req.file.originalname,
        contentType: req.file.mimetype,
      });
    } else if (inputType === 'audio' && req.file) {
      formData.append('audio', fs.createReadStream(req.file.path), {
        filename:    req.file.originalname,
        contentType: req.file.mimetype,
      });
    }

    let aiResponse;
    try {
      aiResponse = await axios.post(
        `${AI_ENGINE_URL}/process-grievance-full`,
        formData,
        { headers: formData.getHeaders(), timeout: 90000 }
      );
    } catch (aiErr) {
      console.error('AI engine unavailable during ingest:', aiErr.message);
      grievance.status = 'pending';
      await grievance.save();
      return res.status(503).json({
        message: 'AI Engine unavailable. Your grievance was saved.',
        grievance_id: grievance._id,
        error: 'AI_ENGINE_UNAVAILABLE',
      });
    }
    const aiData = aiResponse.data;

    // 3. Save AiAnalysis document
    const aiAnalysis = new AiAnalysis({
      grievance_id:         grievance._id,
      english_summary:      aiData.english_summary || aiData.english_text || '',
      verification_sentence: aiData.verification_sentence || '',
      detected_language:    aiData.detected_language || 'en-IN',
      ocr_raw_text:         aiData.ocr_raw_text || '',
      stt_transcript:       aiData.stt_transcript || '',
      llm_category:         aiData.category || '',
      llm_priority:         aiData.priority || 'medium',
      keywords:             aiData.keywords || [],
      confidence_score:     aiData.confidence_score || 0,
      processing_ms:        aiData.processing_ms || 0,
    });
    await aiAnalysis.save();

    // 4. Update Grievance with AI results
    // FIX: title field is set here — truncate english_summary to 80 chars
    grievance.title             = (aiData.title || aiData.english_summary || aiData.english_text || 'Untitled Grievance').substring(0, 80);
    grievance.original_text     = aiData.original_text || req.body.text || '';
    grievance.original_language = aiData.detected_language || 'en-IN';
    grievance.category          = aiData.category  || 'other';
    grievance.priority          = aiData.priority  || 'medium';
    grievance.status            = 'pending'; // ready for citizen confirm step
    await grievance.save();

    // 5. Return verification data to frontend
    // FIX: include all fields the VerifyGrievance + GrievanceForm pages need
    res.status(200).json({
      grievance_id:          grievance._id,
      verification_sentence: aiData.verification_sentence || '',
      detected_language:     aiData.detected_language || 'en-IN',
      category:              aiData.category  || 'other',
      priority:              aiData.priority  || 'medium',
      keywords:              aiData.keywords  || [],
      english_summary:       aiData.english_summary || aiData.english_text || '',
      original_text:          grievance.original_text || '',
      confidence_score:      aiData.confidence_score || 0,
    });

  } catch (error) {
    console.error('❌ Ingest error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        message: 'AI Engine is not available. Grievance saved as pending.',
        error: 'AI_ENGINE_UNAVAILABLE',
      });
    }
    res.status(500).json({ message: 'Failed to process grievance', error: error.message });
  }
}

// ─── POST /api/grievance/confirm ────────────────────────────────
router.post('/confirm', auth, async (req, res) => {
  try {
    const { grievance_id, confirmed } = req.body;
    if (!grievance_id) return res.status(400).json({ message: 'grievance_id is required' });

    const grievance = await Grievance.findById(grievance_id);
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });
    if (grievance.user_id.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });

    if (confirmed === false || confirmed === 'false') {
      grievance.status = 'pending';
      await grievance.save();
      return res.status(200).json({ retry: true, message: 'Grievance reset for reprocessing' });
    }

    const oldStatus = grievance.status;
    grievance.status = 'open';
    await grievance.save();

    await StatusUpdate.create({
      grievance_id: grievance._id,
      old_status:   oldStatus,
      new_status:   'open',
      changed_by:   'citizen',
      remark:       'Citizen confirmed AI understanding',
    });

    // Save training data on confirmation
    const aiAnalysis = await AiAnalysis.findOne({ grievance_id: grievance._id });
    if (aiAnalysis) {
      await TrainingData.create({
        original_text:      grievance.original_text || '',
        detected_language:  aiAnalysis.detected_language || 'en-IN',
        english_text:       aiAnalysis.english_summary || '',
        confirmed_category: grievance.category || 'other',
      });
    }

    res.status(200).json({ success: true, grievance_id: grievance._id });
  } catch (error) {
    console.error('❌ Confirm error:', error.message);
    res.status(500).json({ message: 'Failed to confirm grievance', error: error.message });
  }
});

// ─── POST /api/grievance/submit ─────────────────────────────────
router.post('/submit', auth, async (req, res) => {
  try {
    const {
      grievance_id, user_name, user_phone,
      state, district, pincode, address, landmark,
    } = req.body;

    if (!grievance_id) return res.status(400).json({ message: 'grievance_id is required' });

    const grievance = await Grievance.findById(grievance_id);
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });
    if (grievance.user_id.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });

    // Translate address via AI engine
    let translatedAddress = address;
    try {
      const translateRes = await axios.post(`${AI_ENGINE_URL}/translate`, {
        text: address,
        source_language_code: 'auto',
        target_language_code: 'en-IN',
      }, { timeout: 15000 });
      translatedAddress = translateRes.data.translated_text || address;
    } catch (translateErr) {
      console.warn('⚠️ Address translation failed, using original:', translateErr.message);
    }

    // Save location data on Grievance
    grievance.user_name  = user_name;
    grievance.user_phone = user_phone;
    grievance.state      = state;
    grievance.district   = district;
    grievance.pincode    = pincode;
    grievance.address    = translatedAddress;
    grievance.landmark   = landmark;

    // Nominatim for nearby offices
    let nearbyOffices = [];
    try {
      const searchQuery = `${district} ${grievance.category || 'government office'}`;
      const nominatimRes = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: searchQuery, format: 'json', limit: 5, countrycodes: 'in' },
        headers: { 'User-Agent': 'BhashaFlow/1.0 (NIIT University Capstone Project)' },
        timeout: 10000,
      });
      nearbyOffices = (nominatimRes.data || []).map(place => ({
        name: place.display_name,
        lat:  place.lat,
        lng:  place.lon,
      }));
    } catch (nominatimErr) {
      console.warn('⚠️ Nominatim lookup failed:', nominatimErr.message);
    }

    const category   = grievance.category || 'other';
    const { portalLinks, procedureSteps, expectedResolutionDays } = getPortalsForCategory(category, state);

    grievance.portal_links = portalLinks;
    grievance.nearby_offices = nearbyOffices;
    grievance.procedure_steps = procedureSteps;
    grievance.expected_resolution_days = expectedResolutionDays;
    await grievance.save();

    // FIX: response shape matches what AIAnalysis.jsx now expects
    res.status(200).json({
      grievance_id:             grievance._id,
      nearby_offices:           nearbyOffices,
      // FIX: portal_links is a single object (or null) — frontend normalises it to array
      portal_links:             portalLinks,
      procedure_steps:          procedureSteps,
      expected_resolution_days: expectedResolutionDays,
    });

  } catch (error) {
    console.error('❌ Submit error:', error.message);
    res.status(500).json({ message: 'Failed to submit grievance details', error: error.message });
  }
});

// ─── GET /api/grievance/recent ──────────────────────────────────
// FIX: was /my in the old code — route is /recent
router.get('/recent', auth, async (req, res) => {
  try {
    const grievances = await Grievance.find({ user_id: req.user.userId })
      .sort({ submitted_at: -1 });

    const grievanceIds = grievances.map(g => g._id);
    const analyses = await AiAnalysis.find({ grievance_id: { $in: grievanceIds } });
    const analysisMap = {};
    analyses.forEach(a => { analysisMap[a.grievance_id.toString()] = a; });

    const result = grievances.map(g => ({
      ...g.toObject(),
      ai_analysis: analysisMap[g._id.toString()] || null,
    }));

    res.status(200).json({ grievances: result });
  } catch (error) {
    console.error('❌ Recent grievances error:', error.message);
    res.status(500).json({ message: 'Failed to fetch grievances', error: error.message });
  }
});

// ─── GET /api/grievance/:id ─────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

    const aiAnalysis    = await AiAnalysis.findOne({ grievance_id: grievance._id });
    // FIX: return status_timeline key (matches what GrievanceDetail.jsx now reads)
    const statusTimeline = await StatusUpdate.find({ grievance_id: grievance._id })
      .sort({ updated_at: 1 });

    res.status(200).json({
      grievance:       grievance.toObject(),
      ai_analysis:     aiAnalysis || null,
      status_timeline: statusTimeline,
    });
  } catch (error) {
    console.error('❌ Grievance detail error:', error.message);
    res.status(500).json({ message: 'Failed to fetch grievance', error: error.message });
  }
});

// ─── GET /api/grievance/:id/audio ───────────────────────────────
router.get('/:id/audio', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance || !grievance.audio_url)
      return res.status(404).json({ message: 'Audio not found' });

    const audioPath = path.resolve(grievance.audio_url);
    if (!fs.existsSync(audioPath))
      return res.status(404).json({ message: 'Audio file missing from server' });

    res.sendFile(audioPath);
  } catch (error) {
    console.error('❌ Audio stream error:', error.message);
    res.status(500).json({ message: 'Failed to stream audio', error: error.message });
  }
});

export default router;
