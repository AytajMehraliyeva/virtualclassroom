exports.uploadProfile = (req, res) => {
  res.json({ path: `/uploads/profiles/${req.file.filename}` });
};

exports.uploadLessonFile = (req, res) => {
  res.json({ path: `/uploads/lessonFiles/${req.file.filename}` });
};
