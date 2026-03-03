const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date },
  location: { type: String },
  description: { type: String },
  images: [{ type: String }],
  externalLink: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
