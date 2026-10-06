// Load .env before any other module reads process.env
import './env.js';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import admissionsRouter from './routes/admissions.js';
import newsletterRouter from './routes/newsletter.js';
import newsRouter from './routes/news.js';
import authRouter from './routes/auth.js';
import alumniRouter from './routes/alumni.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');

// Only trust X-Forwarded-For when actually deployed behind a reverse proxy
// (set TRUST_PROXY=1). Trusting it unconditionally lets any client spoof its
// IP and bypass every rate limiter.
app.set('trust proxy', process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY : false);

const PORT = process.env.PORT || 5000;

// Initialize Database Tables
initDatabase();

// ---------------------------------------------------------------------------
// Security Headers (equivalent of helmet's core protections)
// ---------------------------------------------------------------------------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  // The SPA uses inline styles, so script execution must stay the only
  // blocking concern here; 'unsafe-inline' for styles is required.
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://images.unsplash.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// ---------------------------------------------------------------------------
// CORS: allowlist instead of wildcard-with-reflection
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow same-origin / server-to-server requests (no Origin header) and
    // any origin on the allowlist.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: false,
}));

// ---------------------------------------------------------------------------
// Global rate limiting + payload size caps
// ---------------------------------------------------------------------------
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
}));

app.use(express.json({ limit: '16kb' }));

// API Routes
app.use('/api', admissionsRouter);
app.use('/api', newsletterRouter);
app.use('/api', newsRouter);
app.use('/api', authRouter);
app.use('/api', alumniRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Rwenanura Parents Primary School API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Unknown API paths return JSON 404 instead of falling through to the SPA
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// Malformed JSON / oversized bodies / unexpected errors: JSON response, never
// a stack trace.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('Unhandled error:', err);
  res.status(status).json({
    success: false,
    error: status === 413 ? 'Request body too large.' : status < 500 ? 'Invalid request.' : 'Internal server error.',
  });
});

// Serve frontend build if dist directory exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Express Backend
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RPPS Unified Express & Frontend Server running on http://localhost:${PORT}`);
});
