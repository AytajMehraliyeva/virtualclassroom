// controllers/roomController.js
const Room = require('../models/Room');
const { nanoid } = require('nanoid');

exports.createRoom = async (req, res) => {
  try {
    const roomId = nanoid(10);
    const adminId = req.user.id;

    const newRoom = new Room({
      roomId,
      adminId,
      users: [adminId],
    });

    await newRoom.save();

    res.status(201).json({ roomId });
  } catch (err) {
    res.status(500).json({ error: 'Otaq yaradılmadı' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.users.includes(userId)) {
      room.users.push(userId);
      await room.save();
    }

    res.json({ message: 'Joined room successfully', roomId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join room' });
  }
};
