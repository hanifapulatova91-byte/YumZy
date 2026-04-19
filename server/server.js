const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/scan', require('./routes/scan.routes'));
app.use('/api/recipes', require('./routes/recipe.routes'));
app.use('/api/checker', require('./routes/checker.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

const { dangerResetDatabase } = require('./controllers/auth.controller');
app.get('/api/reset', dangerResetDatabase);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🍏 YumZy API is running!', version: '1.0.0' });
});

app.get('/api', (req, res) => {
  res.json({ message: '🍏 YumZy /api is reachable!', environment: process.env.NODE_ENV || 'production' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 YumZy Server running on port ${PORT}`);
});
