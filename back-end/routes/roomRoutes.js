const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middlewares/authMiddleware');

// POST /api/rooms/create
router.post('/create', auth, async (req, res) => {
  try {
    const roomId = uuidv4(); // avtomatik unikal ID
    const room = new Room({ roomId, adminId: req.user._id });
    await room.save();
    res.json({ roomId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
