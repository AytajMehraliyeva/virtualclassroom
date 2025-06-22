const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: String,
  username: String,
  message: String,
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
