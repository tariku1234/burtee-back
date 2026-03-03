require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const connectDB = require('../config/db');

(async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'changeme';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, 10);
  const u = new User({ email, passwordHash: hash, name: 'Admin' });
  await u.save();
  console.log('Admin created:', email);
  process.exit(0);
})();
