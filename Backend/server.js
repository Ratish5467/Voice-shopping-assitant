// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const itemRoutes = require('./src/routes/items');
const priceRoutes = require('./src/routes/price');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(express.json());

// Vite default dev origin: http://localhost:5173
const viteDefault = 'http://localhost:5173';
const allowedOrigins = [
  process.env.FRONTEND_URL,       // use in production or explicit frontend dev url
  process.env.VITE_API_URL,      // optional: if you set this env from Vite or elsewhere
  viteDefault,
  'http://localhost:3000',       // optional alternative dev port
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser tools like Postman (no origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('CORS not allowed: ' + origin), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// API routes
app.use('/api', authRoutes);      // /api/login  /api/register
app.use('/api/items', itemRoutes);
app.use('/api/price', priceRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'VoiceCart backend' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));