import express from 'express';
import User from '../models/User.js'; // Import the model
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Save to MongoDB
    const newUser = new User({ name, email, password });
    await newUser.save();
    
    console.log(`✅ Citizen Saved to DB: ${email}`);
    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Email already exists or Server Error" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 LOGIN ATTEMPT: ${email}`);
    
    // For now, we just send a success message
    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;