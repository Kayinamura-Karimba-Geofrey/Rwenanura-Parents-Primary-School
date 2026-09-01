import express from 'express';
import db from '../db.js';

const router = express.Router();

// POST /api/newsletter - Subscribe parent email to bulletin
router.post('/newsletter', (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
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

    console.log(`📧 New Newsletter Subscriber: ${cleanEmail}`);

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to Rwenanura Parents Primary School updates!'
    });

  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ success: false, error: 'Database processing error' });
  }
});

// GET /api/newsletter - List subscribers
router.get('/newsletter', (req, res) => {
  try {
    const subscribers = db.prepare('SELECT * FROM subscribers ORDER BY id DESC').all();
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Fetch error' });
  }
});

export default router;
