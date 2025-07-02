const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('Duplicate user:', existingUser);
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();
    console.log('User created:', user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Register error:', err);

    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username or Email already exists' });
    }

    res.status(500).json({ error: 'Server error' });
  }
});




router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) return res.status(400).json({ error: 'Email/username and password are required' });

  // user tapılır
  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  // şifrə yoxlanılır
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  // token yaradılır
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
});




module.exports = router;
