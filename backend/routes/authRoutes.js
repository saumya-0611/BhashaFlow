import express from 'express';
import User from '../models/User.js'; // Import the model
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // 1. ADDED: Import JWT

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
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

    // 3. ADDED: Generate the secure JWT 
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Pulled from your docker .env file
      { expiresIn: '1h' }     // Token expires in 1 hour
    );

    // 4. UPDATED: Send the token back to the React frontend
    res.status(200).json({ 
      message: "Login successful!", 
      token: token, 
      user: { name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;