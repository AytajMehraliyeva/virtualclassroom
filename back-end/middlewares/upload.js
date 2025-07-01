const multer = require('multer');
const path = require('path');

// Profil şəkli üçün storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

// Dərs faylı üçün storage
const lessonFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/lessonFiles');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const uploadProfile = multer({ storage: profileStorage });
const uploadLessonFile = multer({ storage: lessonFileStorage });

module.exports = { uploadProfile, uploadLessonFile };
