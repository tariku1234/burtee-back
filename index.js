require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

// allow requests from the deployed frontend; fall back to localhost for local dev
// FRONTEND_URL can be a single URL or a comma-separated list of allowed origins
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('CORS will allow origin(s):', frontendOrigin);
app.use(
  cors({
    origin: (origin, callback) => {
      // when no origin (e.g. server-to-server) allow it
      if (!origin) return callback(null, true);
      const allowed = frontendOrigin.split(',');
      if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS')); // will trigger error on client
      }
    },
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// if React build exists, serve it (optional)
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));

app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/events', require('./routes/events'));

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
