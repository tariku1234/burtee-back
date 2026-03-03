const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const EVENT_PATH = path.join(__dirname, '../uploads/events');
if (!fs.existsSync(EVENT_PATH)) fs.mkdirSync(EVENT_PATH, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, EVENT_PATH),
  filename: (req, file, cb) => cb(null, 'event-' + Date.now() + '-' + Math.round(Math.random()*1e6) + path.extname(file.originalname))
});
const upload = multer({ storage });

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = data; next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
}

// Public: list events
router.get('/', async (req, res) => {
  const events = await Event.find({}).sort({ date: -1 });
  res.json(events);
});

// Admin: create event with image
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    let images = [];
    if (req.file) images = ['/uploads/events/' + req.file.filename];
    if (data.images) {
      // Accept images as JSON array string (for future multi-upload)
      try { images = JSON.parse(data.images); } catch {}
    }
    const ev = new Event({
      ...data,
      images
    });
    await ev.save();
    res.json(ev);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: update event (with optional new image)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    let images = [];
    if (req.file) images = ['/uploads/events/' + req.file.filename];
    if (data.images) {
      try { images = JSON.parse(data.images); } catch {}
    }
    const update = {
      title: data.title,
      date: data.date,
      location: data.location,
      description: data.description,
      externalLink: data.externalLink,
    };
    if (images.length) update.images = images;
    const ev = await Event.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(ev);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: delete event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
