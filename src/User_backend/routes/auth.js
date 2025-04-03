import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js'; // Import the auth middleware

const router = express.Router();

// Protected route to get user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Fetch the user using the user ID from the decoded token
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // // Send back user data (avoid sending sensitive info like password)
    // const { password, ...userData } = user.toObject();
    res.json(user); // Return the user data in the response
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1d' });
    res.status(201).json({ token, userId: user._id, user: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1d' });
    res.json({ token, userId: user._id, user: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Logout (Client should handle token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;

// import express from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// const router = express.Router();

// // Signup
// router.post('/signup', async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     const user = new User({ username, email, password });
//     await user.save();
//     const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
//     res.status(201).json({ token, userId: user._id });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) throw new Error('User not found');
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) throw new Error('Invalid credentials');
//     const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
//     res.json({ token, userId: user._id });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// export default router;