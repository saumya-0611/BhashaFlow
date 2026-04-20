import express from 'express';
import auth from '../middleware/auth.js';
import Grievance from '../models/Grievance.js';
import AiAnalysis from '../models/AiAnalysis.js';
import StatusUpdate from '../models/StatusUpdate.js';

const router = express.Router();

// ─── Role Check Middleware ──────────────────────────────────────
// Only 'authority' and 'admin' roles can access admin routes.
const requireAdmin = (req, res, next) => {
  if (!req.user || !['authority', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin or Authority role required.' });
  }
  next();
};

// Apply auth + role check to all admin routes
router.use(auth, requireAdmin);

// ─── GET /api/admin/grievances ──────────────────────────────────
// Paginated list with filters: status, category, language, priority.
router.get('/grievances', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      language,
      priority,
      sort_by = 'submitted_at',
      sort_order = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (language) filter.original_language = language;
    if (priority) filter.priority = priority;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortDirection = sort_order === 'asc' ? 1 : -1;

    const [grievances, total] = await Promise.all([
      Grievance.find(filter)
        .sort({ [sort_by]: sortDirection })
        .skip(skip)
        .limit(limitNum),
      Grievance.countDocuments(filter)
    ]);

    // Populate with AI analysis
    const grievanceIds = grievances.map(g => g._id);
    const analyses = await AiAnalysis.find({ grievance_id: { $in: grievanceIds } });
    const analysisMap = {};
    analyses.forEach(a => { analysisMap[a.grievance_id.toString()] = a; });

    const result = grievances.map(g => ({
      ...g.toObject(),
      ai_analysis: analysisMap[g._id.toString()] || null
    }));

    res.status(200).json({
      grievances: result,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_count: total,
        per_page: limitNum
      }
    });
  } catch (error) {
    console.error('❌ Admin grievances list error:', error.message);
    res.status(500).json({ message: 'Failed to fetch grievances', error: error.message });
  }
});

// ─── GET /api/admin/grievance/:id ───────────────────────────────
// Full detail: grievance + ai_analysis + status_updates timeline.
router.get('/grievance/:id', async (req, res) => {
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
    console.error('❌ Admin grievance detail error:', error.message);
    res.status(500).json({ message: 'Failed to fetch grievance details', error: error.message });
  }
});

// ─── PUT /api/admin/grievance/:id/status ────────────────────────
// Update status. Create StatusUpdate document. Set resolved_at if resolved.
router.put('/grievance/:id/status', async (req, res) => {
  try {
    const { status, remark } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    const validStatuses = ['pending', 'processing', 'open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    const oldStatus = grievance.status;
    grievance.status = status;

    // Set resolved_at timestamp when marking as resolved
    if (status === 'resolved') {
      grievance.resolved_at = new Date();
    }

    await grievance.save();

    // Create audit log entry
    await StatusUpdate.create({
      grievance_id: grievance._id,
      old_status: oldStatus,
      new_status: status,
      changed_by: req.user.email,
      remark: remark || ''
    });

    res.status(200).json({
      message: `Status updated from '${oldStatus}' to '${status}'`,
      grievance_id: grievance._id,
      old_status: oldStatus,
      new_status: status
    });
  } catch (error) {
    console.error('❌ Status update error:', error.message);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

// ─── PUT /api/admin/grievance/:id/assign ────────────────────────
// Set assigned_to field. Create StatusUpdate.
router.put('/grievance/:id/assign', async (req, res) => {
  try {
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ message: 'assigned_to is required' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    const previousAssignment = grievance.assigned_to || 'unassigned';
    grievance.assigned_to = assigned_to;

    // If grievance was 'open', move to 'in_progress' on assignment
    const oldStatus = grievance.status;
    if (grievance.status === 'open') {
      grievance.status = 'in_progress';
    }

    await grievance.save();

    // Create audit log
    await StatusUpdate.create({
      grievance_id: grievance._id,
      old_status: oldStatus,
      new_status: grievance.status,
      changed_by: req.user.email,
      remark: `Assigned to ${assigned_to} (was: ${previousAssignment})`
    });

    res.status(200).json({
      message: `Grievance assigned to '${assigned_to}'`,
      grievance_id: grievance._id,
      assigned_to: assigned_to,
      status: grievance.status
    });
  } catch (error) {
    console.error('❌ Assignment error:', error.message);
    res.status(500).json({ message: 'Failed to assign grievance', error: error.message });
  }
});

// ─── GET /api/admin/stats ───────────────────────────────────────
// Dashboard stats: total, by_status, by_category, by_language, avg_resolution_hours.
router.get('/stats', async (req, res) => {
  try {
    const [
      total,
      byStatus,
      byCategory,
      byLanguage,
      resolvedGrievances
    ] = await Promise.all([
      Grievance.countDocuments(),

      Grievance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      Grievance.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),

      Grievance.aggregate([
        { $group: { _id: '$original_language', count: { $sum: 1 } } }
      ]),

      // Calculate avg resolution time for resolved grievances
      Grievance.find({ status: 'resolved', resolved_at: { $exists: true } })
        .select('submitted_at resolved_at')
    ]);

    // Convert aggregation results to maps
    const statusMap = {};
    byStatus.forEach(item => { statusMap[item._id || 'unknown'] = item.count; });

    const categoryMap = {};
    byCategory.forEach(item => { categoryMap[item._id || 'unknown'] = item.count; });

    const languageMap = {};
    byLanguage.forEach(item => { languageMap[item._id || 'unknown'] = item.count; });

    // Calculate average resolution hours
    let avgResolutionHours = 0;
    if (resolvedGrievances.length > 0) {
      const totalHours = resolvedGrievances.reduce((sum, g) => {
        const hours = (new Date(g.resolved_at) - new Date(g.submitted_at)) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedGrievances.length) * 10) / 10;
    }

    res.status(200).json({
      total,
      by_status: statusMap,
      by_category: categoryMap,
      by_language: languageMap,
      avg_resolution_hours: avgResolutionHours,
      resolved_count: resolvedGrievances.length
    });
  } catch (error) {
    console.error('❌ Stats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

export default router;
