const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Profile = require('../models/Profile');

const PROFILE_PATH = path.join(__dirname, '../uploads/profile');
if (!fs.existsSync(PROFILE_PATH)) fs.mkdirSync(PROFILE_PATH, { recursive: true });

// Function to get profile from DB
const getProfile = async () => {
  let profile = await Profile.findOne();
  if (!profile) {
    profile = new Profile({
      profileImage: '',
      images: [],
      name: 'Admin',
      bio: 'Radio journalist, field reporter and storyteller.'
    });
    await profile.save();
  }
  return profile;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_PATH),
  filename: (req, file, cb) => cb(null, 'profile-' + Date.now() + '-' + Math.round(Math.random()*1e6) + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET profile
router.get('/', async (req, res) => {
  try {
    const profile = await getProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// POST multiple profile images
router.post('/image', upload.array('image', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });
    const urls = req.files.map(f => '/uploads/profile/' + f.filename);
    const profile = await getProfile();
    profile.images = [...(profile.images || []), ...urls];
    // Set the first image as profileImage if not set
    if (!profile.profileImage && urls.length > 0) profile.profileImage = urls[0];
    await profile.save();
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a profile image by URL
router.delete('/image', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'No url provided' });
    const profile = await getProfile();
    profile.images = (profile.images || []).filter(img => img !== url);
    if (profile.profileImage === url) profile.profileImage = profile.images[0] || '';
    await profile.save();
    // Optionally delete file from disk
    const filePath = path.join(__dirname, '../..', url);
    fs.unlink(filePath, () => {});
    res.json({ images: profile.images, profileImage: profile.profileImage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH profile info (name, bio, profileImage)
router.patch('/', async (req, res) => {
  try {
    const { name, bio, profileImage } = req.body;
    const profile = await getProfile();
    if (name) profile.name = name;
    if (bio) profile.bio = bio;
    if (profileImage && profile.images.includes(profileImage)) {
      profile.profileImage = profileImage;
      // Move to front
      profile.images = [profileImage, ...profile.images.filter(img => img !== profileImage)];
    }
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
