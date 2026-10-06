import express from 'express';
import db from '../db.js';
import { authenticateToken, requireRole } from './auth.js';

const router = express.Router();

const CATEGORIES = ['academic', 'holiday', 'community'];
const TERM_STATUSES = ['active', 'upcoming', 'completed'];
const LANGS = ['en', 'rw', 'fr'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const MAX_LEN = { title: 160, description: 1000, audience: 80, location: 120, period: 80, highlights: 400 };

// "Sep 07, 2026", "Oct 26 – Oct 30, 2026" or "Dec 28, 2026 – Jan 02, 2027".
// Built from the date strings directly so the server's timezone never shifts a day.
function formatDateRange(start, end) {
  const [, sy, sm, sd] = start.match(DATETIME_RE);
  const [, ey, em, ed] = end.match(DATETIME_RE);
  const s = `${MONTHS[sm - 1]} ${sd}`;
  const e = `${MONTHS[em - 1]} ${ed}`;
  if (start.slice(0, 10) === end.slice(0, 10)) return `${s}, ${sy}`;
  if (sy === ey) return `${s} – ${e}, ${sy}`;
  return `${s}, ${sy} – ${e}, ${ey}`;
}

function isValidDateTime(value) {
  const m = typeof value === 'string' && value.match(DATETIME_RE);
  if (!m) return false;
  const [, y, mo, d, h, mi] = m.map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d && h < 24 && mi < 60;
}

// Accepts { en, rw?, fr? }; English is required, the others fall back to it.
function cleanLocalized(value, max, required = true) {
  if (value == null || typeof value !== 'object') return required ? null : {};
  const out = {};
  for (const lang of LANGS) {
    const text = value[lang];
    if (text == null || text === '') continue;
    if (typeof text !== 'string' || text.trim().length > max) return null;
    out[lang] = text.trim();
  }
  return required && !out.en ? null : out;
}

function optionalText(value, max) {
  if (value == null || value === '') return '';
  return typeof value === 'string' && value.trim().length <= max ? value.trim() : null;
}

function toTerm(row) {
  return {
    id: row.id,
    termNumber: row.term_number,
    name: JSON.parse(row.name),
    period: row.period,
    duration: row.duration,
    status: row.status,
    highlights: JSON.parse(row.highlights),
  };
}

function toEvent(row) {
  return {
    id: row.id,
    term: row.term,
    category: row.category,
    title: JSON.parse(row.title),
    description: JSON.parse(row.description),
    dateDisplay: formatDateRange(row.start_date, row.end_date),
    startDate: `${row.start_date}:00`,
    endDate: `${row.end_date}:00`,
    audience: row.audience || '',
    location: row.location || '',
  };
}

// Validate an event payload; returns { error } or { values } in column order.
function validateEvent(body) {
  const { term, category, title, description, startDate, endDate, audience, location } = body || {};
  if (!db.prepare('SELECT id FROM academic_terms WHERE id = ?').get(term)) return { error: 'Please choose a valid term.' };
  if (!CATEGORIES.includes(category)) return { error: `Category must be one of: ${CATEGORIES.join(', ')}.` };
  const cleanTitle = cleanLocalized(title, MAX_LEN.title);
  if (!cleanTitle) return { error: `An English title of at most ${MAX_LEN.title} characters is required.` };
  const cleanDescription = cleanLocalized(description, MAX_LEN.description, false);
  if (!cleanDescription) return { error: `Descriptions must be at most ${MAX_LEN.description} characters.` };
  if (!isValidDateTime(startDate) || !isValidDateTime(endDate)) return { error: 'Start and end must be valid dates and times.' };
  if (endDate < startDate) return { error: 'The end must be after the start.' };
  const cleanAudience = optionalText(audience, MAX_LEN.audience);
  const cleanLocation = optionalText(location, MAX_LEN.location);
  if (cleanAudience === null || cleanLocation === null) return { error: 'Audience or location is too long.' };
  return {
    values: [term, category, JSON.stringify(cleanTitle), JSON.stringify(cleanDescription), startDate, endDate, cleanAudience, cleanLocation],
  };
}

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) ? id : null;
}

// GET /api/calendar - School calendar (signed-in students, staff and admins only)
router.get('/calendar', authenticateToken, requireRole('student', 'staff', 'admin'), (req, res) => {
  try {
    res.setHeader('Cache-Control', 'private, no-store');
    res.json({
      success: true,
      terms: db.prepare('SELECT * FROM academic_terms ORDER BY term_number').all().map(toTerm),
      events: db.prepare('SELECT * FROM calendar_events ORDER BY start_date, id').all().map(toEvent),
    });
  } catch (err) {
    console.error('Error loading calendar:', err);
    res.status(500).json({ success: false, error: 'Failed to load the calendar.' });
  }
});

// POST /api/calendar/events - Add an event (staff/admin)
router.post('/calendar/events', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const { error, values } = validateEvent(req.body);
    if (error) return res.status(400).json({ success: false, error });
    const info = db.prepare(`
      INSERT INTO calendar_events (term, category, title, description, start_date, end_date, audience, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values);
    const event = toEvent(db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(info.lastInsertRowid));
    res.status(201).json({ success: true, event });
  } catch (err) {
    console.error('Error creating calendar event:', err);
    res.status(500).json({ success: false, error: 'Failed to add the event.' });
  }
});

// PUT /api/calendar/events/:id - Replace an event (staff/admin)
router.put('/calendar/events/:id', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ success: false, error: 'Invalid event id.' });
    const { error, values } = validateEvent(req.body);
    if (error) return res.status(400).json({ success: false, error });
    const result = db.prepare(`
      UPDATE calendar_events
      SET term = ?, category = ?, title = ?, description = ?, start_date = ?, end_date = ?, audience = ?, location = ?
      WHERE id = ?
    `).run(...values, id);
    if (result.changes === 0) return res.status(404).json({ success: false, error: 'Event not found.' });
    res.json({ success: true, event: toEvent(db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id)) });
  } catch (err) {
    console.error('Error updating calendar event:', err);
    res.status(500).json({ success: false, error: 'Failed to update the event.' });
  }
});

// DELETE /api/calendar/events/:id - Remove an event (staff/admin)
router.delete('/calendar/events/:id', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ success: false, error: 'Invalid event id.' });
    const result = db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ success: false, error: 'Event not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    res.status(500).json({ success: false, error: 'Failed to delete the event.' });
  }
});

// PATCH /api/calendar/terms/:id - Update a term's dates, status or highlights (staff/admin)
router.patch('/calendar/terms/:id', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM academic_terms WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Term not found.' });
    const { period, status, highlights } = req.body || {};

    const nextPeriod = period === undefined ? row.period : optionalText(period, MAX_LEN.period);
    if (!nextPeriod) return res.status(400).json({ success: false, error: `Term dates are required (max ${MAX_LEN.period} characters).` });
    const nextStatus = status === undefined ? row.status : status;
    if (!TERM_STATUSES.includes(nextStatus)) return res.status(400).json({ success: false, error: `Status must be one of: ${TERM_STATUSES.join(', ')}.` });
    let nextHighlights = row.highlights;
    if (highlights !== undefined) {
      const clean = cleanLocalized(highlights, MAX_LEN.highlights);
      if (!clean) return res.status(400).json({ success: false, error: `English highlights of at most ${MAX_LEN.highlights} characters are required.` });
      // Keep existing translations unless new ones are given
      nextHighlights = JSON.stringify({ ...JSON.parse(row.highlights), ...clean });
    }

    // Only one term can be the active one; the previous active term becomes
    // completed if it comes earlier in the year, upcoming otherwise.
    db.transaction(() => {
      if (nextStatus === 'active') {
        db.prepare(`
          UPDATE academic_terms
          SET status = CASE WHEN term_number < ? THEN 'completed' ELSE 'upcoming' END
          WHERE status = 'active' AND id != ?
        `).run(row.term_number, row.id);
      }
      db.prepare('UPDATE academic_terms SET period = ?, status = ?, highlights = ? WHERE id = ?')
        .run(nextPeriod, nextStatus, nextHighlights, row.id);
    })();
    res.json({ success: true, term: toTerm(db.prepare('SELECT * FROM academic_terms WHERE id = ?').get(row.id)) });
  } catch (err) {
    console.error('Error updating term:', err);
    res.status(500).json({ success: false, error: 'Failed to update the term.' });
  }
});

export default router;
