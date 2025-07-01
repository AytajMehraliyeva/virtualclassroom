const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Profil şəkli upload üçün storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Profil məlumatını gətir
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    profilePicture: req.user.profilePicture
  });
});

// Profil məlumatını yenilə
router.post('/update-profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (req.body.username) {
      req.user.username = req.body.username;
    }

    if (req.file) {
      req.user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profilePicture: req.user.profilePicture
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
