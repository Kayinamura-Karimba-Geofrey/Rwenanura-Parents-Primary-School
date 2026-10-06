import express from 'express';
import rateLimit from 'express-rate-limit';
import db from '../db.js';
import { authenticateToken, requireRole } from './auth.js';

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many subscribe attempts from this IP address. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter - Subscribe parent email to bulletin
router.post('/newsletter', subscribeLimiter, (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (email.trim().length > 200) {
      return res.status(400).json({ success: false, error: 'Email address is too long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existing = db.prepare('SELECT id FROM subscribers WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.json({
        success: true,
        message: 'You are already subscribed to the RPPS official bulletin!'
      });
    }

    const stmt = db.prepare('INSERT INTO subscribers (email) VALUES (?)');
    stmt.run(cleanEmail);

    console.log('📧 New newsletter subscriber');

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to Rwenanura Parents Primary School updates!'
    });

  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ success: false, error: 'Database processing error' });
  }
});

// GET /api/newsletter - List subscribers (staff/admin only).
// SECURITY: subscriber PII must never be served without authentication.
router.get('/newsletter', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const subscribers = db.prepare('SELECT * FROM subscribers ORDER BY id DESC').all();
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Fetch error' });
  }
});

export default router;
