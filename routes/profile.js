const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const PROFILE_PATH = path.join(__dirname, '../uploads/profile');
const PROFILE_JSON = path.join(PROFILE_PATH, 'profile.json');
if (!fs.existsSync(PROFILE_PATH)) fs.mkdirSync(PROFILE_PATH, { recursive: true });

// Function to load profile from JSON
const loadProfile = () => {
  try {
    if (fs.existsSync(PROFILE_JSON)) {
      const data = fs.readFileSync(PROFILE_JSON, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
  return {
    profileImage: '',
    images: [],
    name: 'Admin',
    bio: 'Radio journalist, field reporter and storyteller.'
  };
};

// Function to save profile to JSON
const saveProfile = (profileData) => {
  try {
    fs.writeFileSync(PROFILE_JSON, JSON.stringify(profileData, null, 2));
  } catch (err) {
    console.error('Error saving profile:', err);
  }
};

// Load profile data
let profile = loadProfile();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_PATH),
  filename: (req, file, cb) => cb(null, 'profile-' + Date.now() + '-' + Math.round(Math.random()*1e6) + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET profile
router.get('/', (req, res) => {
  res.json(profile);
});


// POST multiple profile images
router.post('/image', upload.array('image', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });
  const urls = req.files.map(f => '/uploads/profile/' + f.filename);
  profile.images = [...(profile.images || []), ...urls];
  // Set the first image as profileImage if not set
  if (!profile.profileImage && urls.length > 0) profile.profileImage = urls[0];
  saveProfile(profile);
  res.json({ urls });
});

// DELETE a profile image by URL
router.delete('/image', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'No url provided' });
  profile.images = (profile.images || []).filter(img => img !== url);
  if (profile.profileImage === url) profile.profileImage = profile.images[0] || '';
  // Optionally delete file from disk
  const filePath = path.join(__dirname, '../..', url);
  fs.unlink(filePath, () => {});
  saveProfile(profile);
  res.json({ images: profile.images, profileImage: profile.profileImage });
});

// PATCH profile info (name, bio, profileImage)
router.patch('/', (req, res) => {
  const { name, bio, profileImage } = req.body;
  if (name) profile.name = name;
  if (bio) profile.bio = bio;
  if (profileImage && profile.images.includes(profileImage)) {
    profile.profileImage = profileImage;
    // Move to front
    profile.images = [profileImage, ...profile.images.filter(img => img !== profileImage)];
  }
  saveProfile(profile);
  res.json(profile);
});

module.exports = router;
