import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ─── REGISTER ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, preferred_language } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Role is always 'citizen' on self-registration.
    // Authority/admin accounts must be created by an existing admin directly in the DB.
    const newUser = new User({
      name,
      email,
      password,
      role: 'citizen',
      phone: phone || undefined,
      preferred_language: preferred_language || 'en-IN'
    });

    await newUser.save();

    console.log(`✅ Citizen Saved to DB: ${email}`);
    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Email already exists or Server Error' });
  }
});

// ─── LOGIN ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate secure JWT with role in payload
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token and user info back to React frontend
    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        preferred_language: user.preferred_language
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;