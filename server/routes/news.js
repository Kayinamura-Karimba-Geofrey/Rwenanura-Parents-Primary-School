import express from 'express';
import db from '../db.js';
import { authenticateToken, requireRole } from './auth.js';

const router = express.Router();

// Length caps for all free-text news fields
const MAX_LEN = {
  title: 200,
  type: 10,
  category: 60,
  day: 2,
  month: 3,
  year: 4,
  time: 60,
  location: 120,
  summary: 1000,
};

const VALID_TYPES = ['news', 'event'];

function capped(value, max) {
  return String(value).trim().substring(0, max);
}

// GET /api/news - Fetch all news & events from database
router.get('/news', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM news_events ORDER BY id DESC').all();
    const formatted = items.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      category: item.category,
      date: {
        day: item.day_str,
        month: item.month_str,
        year: item.year_str
      },
      time: item.time_str,
      location: item.location,
      summary: item.summary
    }));

    res.json({
      success: true,
      count: formatted.length,
      newsAndEvents: formatted
    });
  } catch (err) {
    console.error('Error fetching news & events:', err);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

// POST /api/news - Create new news item or event (Protected Admin)
// SECURITY: requireRole was missing here, which let any self-registered
// alumni account publish articles on the public landing page.
router.post('/news', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const { title, type, category, day, month, year, time, location, summary } = req.body || {};

    if (!title || !category || !day || !month || !summary) {
      return res.status(400).json({ success: false, error: 'Title, category, date, and summary are required.' });
    }

    const fields = [title, type, category, day, month, year, time, location, summary];
    if (fields.some(v => v != null && typeof v !== 'string' && typeof v !== 'number')) {
      return res.status(400).json({ success: false, error: 'Invalid input format.' });
    }

    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, error: `Type must be one of: ${VALID_TYPES.join(', ')}` });
    }

    const stmt = db.prepare(`
      INSERT INTO news_events (title, type, category, day_str, month_str, year_str, time_str, location, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      capped(title, MAX_LEN.title),
      capped(type || 'news', MAX_LEN.type),
      capped(category, MAX_LEN.category),
      capped(day.toString().padStart(2, '0'), MAX_LEN.day),
      capped(String(month).toUpperCase().substring(0, 3), MAX_LEN.month),
      capped((year || new Date().getFullYear()).toString(), MAX_LEN.year),
      capped(time || 'All Day', MAX_LEN.time),
      capped(location || 'School Campus', MAX_LEN.location),
      capped(summary, MAX_LEN.summary)
    );

    console.log(`📢 New Article Published: "${title}" (${category})`);

    res.status(201).json({
      success: true,
      message: 'News article created successfully!',
      id: info.lastInsertRowid
    });

  } catch (err) {
    console.error('Error creating news item:', err);
    res.status(500).json({ success: false, error: 'Failed to create news item.' });
  }
});

// DELETE /api/news/:id - Delete news item or event (Protected Admin)
router.delete('/news/:id', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const newsId = Number.parseInt(id, 10);
    if (!Number.isInteger(newsId)) {
      return res.status(400).json({ success: false, error: 'Invalid article id.' });
    }
    const stmt = db.prepare('DELETE FROM news_events WHERE id = ?');
    const result = stmt.run(newsId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Article not found.' });
    }

    res.json({ success: true, message: 'Article deleted successfully!' });
  } catch (err) {
    console.error('Error deleting news item:', err);
    res.status(500).json({ success: false, error: 'Failed to delete article.' });
  }
});

export default router;
