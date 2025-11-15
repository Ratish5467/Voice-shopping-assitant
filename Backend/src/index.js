require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

function safeRequire(path) {
  try {
    const mod = require(path);
    return { ok: true, module: mod };
  } catch (err) {
    return { ok: false, error: err };
  }
}

console.log('Starting server (debug mode)');
connectDB();

app.use(helmet());
app.use(express.json());
app.use(cors());

const candidates = [
  { mount: '/api', path: './src/routes/auth' },
  { mount: '/api/items', path: './src/routes/items' },
  { mount: '/api/price', path: './src/routes/price' },
  { mount: '/api/users', path: './routes/profile' },
];

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} body:`, req.body);
  next();
});

app.use((err, req, res, next) => {
  console.error('💥 UNHANDLED ERROR:', err && (err.stack || err.message || err));
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

candidates.forEach((c) => {
  const res = safeRequire(c.path);

  if (!res.ok) {
    console.error(`FAILED require('${c.path}') ->`, res.error && res.error.message ? res.error.message : res.error);
    return;
  }

  const mod = res.module;
  const t = typeof mod;

  console.log(`require('${c.path}') -> type: ${t}`);

  const isRouterLike =
    (typeof mod === 'function') ||
    (mod && typeof mod === 'object' && typeof mod.use === 'function') ||
    (mod && mod.__esModule && typeof mod.default === 'function');

  if (!isRouterLike) {
    console.error(`Module at '${c.path}' is not an Express router/middleware. Received type: ${t}`);
    if (mod && typeof mod === 'object') console.error('module keys:', Object.keys(mod));
    return;
  }

  const router = (mod && mod.__esModule && mod.default) ? mod.default : mod;

  console.log(`Mounting ${c.path} on ${c.mount}`);
  app.use(c.mount, router);
});

app.get('/', (req, res) => res.json({ ok: true, message: 'VoiceCart backend (debug)' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));