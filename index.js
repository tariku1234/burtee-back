require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
