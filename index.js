require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

// allow requests from the deployed frontend; fall back to allowing all origins for quick deploy
// FRONTEND_URL can be a single URL, a comma-separated list, or "*" to allow any origin
const frontendOrigin = process.env.FRONTEND_URL || '*';
console.log('CORS will allow origin(s):', frontendOrigin);
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server, curl, etc.
      if (!origin) return callback(null, true);

      // allow all when set explicitly
      if (frontendOrigin === '*' || frontendOrigin === '*') {
        return callback(null, true);
      }

      const allowed = frontendOrigin.split(',').map(s => s.trim());
      if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('CORS rejected origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (API) - placed before static serving so they are always hit
console.log('Loading routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/events', require('./routes/events'));
console.log('Routes loaded successfully');

// simple ping for sanity check
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// if React build exists, serve it (optional)
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Global error handlers to make crashes visible in the console
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
	// exit after logged so a process manager (or dev) can restart
	process.exit(1);
});

process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Rejection:', reason && reason.stack ? reason.stack : reason);
});
