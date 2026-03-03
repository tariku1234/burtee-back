const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  message: { type: String, required: true },
  sent: { type: Boolean, default: false },
  sentAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
