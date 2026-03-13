const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// simple auth middleware reused in other routes
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = data; next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
}

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const msg = new Message({ name, email, message, sent: false });
    await msg.save();

    // attempt to send email if SMTP configured
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
        }
      });
      const mail = {
        from: process.env.EMAIL_USER,
        to: process.env.CONTACT_DESTINATION_EMAIL || process.env.EMAIL_USER,
        subject: `New contact from portfolio: ${email}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`
      };
      try {
        await transporter.sendMail(mail);
        msg.sent = true; msg.sentAt = new Date();
        await msg.save();
      } catch (err) {
        console.error('Email send failed:', err.message);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: list all messages
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const msgs = await Message.find({}).sort({ createdAt: -1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

module.exports = router;
