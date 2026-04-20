import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

// Route imports
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Cron job import
import { startCronJobs } from './utils/cronJobs.js';

// ─── Configuration ──────────────────────────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (images, audio)
// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}
app.use('/uploads', express.static('uploads'));

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/grievance', grievanceRoutes);    // Protected by auth middleware internally
app.use('/api/admin', adminRoutes);            // Protected by auth + role check internally

// ─── Health Check ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'BhashaFlow Backend',
    message: 'BhashaFlow Backend is running and connected to DB!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ─── MongoDB Atlas Connection ───────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ─── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/`);

  // Start cron jobs after server is up
  startCronJobs();
});