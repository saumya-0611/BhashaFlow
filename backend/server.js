import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; // 1. Import the new routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 2. Link the Auth Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'online',
        service: 'BhashaFlow Backend',
        message: 'BhashaFlow Backend is running and connected to DB!',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});