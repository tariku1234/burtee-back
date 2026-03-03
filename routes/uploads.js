const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({ storage });

// POST /api/uploads/image
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const publicPath = `/uploads/${req.file.filename}`;
  res.json({ url: publicPath });
});

module.exports = router;
