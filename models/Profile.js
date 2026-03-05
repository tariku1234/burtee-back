const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  profileImage: { type: String, default: '' },
  images: [{ type: String }],
  name: { type: String, default: 'Admin' },
  bio: { type: String, default: 'Radio journalist, field reporter and storyteller.' }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);