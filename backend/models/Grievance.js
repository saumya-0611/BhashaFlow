import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String },
  original_text: { type: String },
  original_language: { type: String },
  input_type: {
    type: String,
    enum: ['text', 'image', 'audio']
  },
  image_url: { type: String },
  audio_url: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'open', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: ['water', 'roads', 'electricity', 'sanitation', 'education', 'healthcare', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  assigned_to: { type: String },
  user_name: { type: String },
  user_phone: { type: String },
  state: { type: String },
  district: { type: String },
  pincode: { type: String },
  address: { type: String },
  landmark: { type: String },
  portal_links: { type: mongoose.Schema.Types.Mixed, default: null },
  nearby_offices: { type: [mongoose.Schema.Types.Mixed], default: [] },
  procedure_steps: { type: [String], default: [] },
  expected_resolution_days: { type: Number, default: null },
  follow_up_sent: { type: Boolean, default: false },
  submitted_at: { type: Date, default: Date.now },
  resolved_at: { type: Date }
});

export default mongoose.model('Grievance', grievanceSchema);
