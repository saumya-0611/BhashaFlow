import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.json({ message: 'BhashaFlow Backend is running and connected to DB!' });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});