import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Import bcrypt

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ─── AUTOMATIC HASHING BEFORE SAVE ───
userSchema.pre('save', async function(next) {
  // Only hash the password if it's new or being modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10); // Generate a unique "salt"
    this.password = await bcrypt.hash(this.password, salt); // Hash it!
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('User', userSchema);