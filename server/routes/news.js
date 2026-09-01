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

// POST /api/news - Create new news item or event (Admin)
router.post('/news', (req, res) => {
  try {
    const { title, type, category, day, month, year, time, location, summary } = req.body;

    if (!title || !category || !day || !month || !summary) {
      return res.status(400).json({ success: false, error: 'Title, category, date, and summary are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO news_events (title, type, category, day_str, month_str, year_str, time_str, location, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      title.trim(),
      type || 'news',
      category.trim(),
      day.toString().padStart(2, '0'),
      month.toUpperCase().substring(0, 3),
      (year || new Date().getFullYear()).toString(),
      time || 'All Day',
      location || 'School Campus',
      summary.trim()
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

// DELETE /api/news/:id - Delete news item or event (Admin)
router.delete('/news/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM news_events WHERE id = ?');
    const result = stmt.run(id);

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
