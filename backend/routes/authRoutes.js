import express from 'express';
import User from '../models/User.js'; // Import the model
import bcrypt from 'bcrypt';

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
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful!", user: { name: user.name } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;