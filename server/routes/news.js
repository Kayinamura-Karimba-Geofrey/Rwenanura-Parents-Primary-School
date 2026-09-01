import express from 'express';
import db from '../db.js';

const router = express.Router();

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

export default router;
