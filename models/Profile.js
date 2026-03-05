const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  profileImage: { type: String, default: '' }, // data URL
  images: [{ type: String }], // array of data URLs
  name: { type: String, default: 'Admin' },
  bio: { type: String, default: 'Radio journalist, field reporter and storyteller.' }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);