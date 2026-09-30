import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import db from '../db.js';
import { authenticateToken, requireRole } from './auth.js';

const router = express.Router();

// Slow public form spam without blocking legitimate parents
const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many applications submitted from this IP address. Please contact the school office directly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const MAX_LEN = {
  parentName: 120,
  phone: 30,
  email: 200,
  childName: 120,
  grade: 30,
  notes: 1000,
};

const VALID_STATUSES = ['Pending', 'Under Review', 'Approved'];

// Helper to generate an unguessable tracking code. A 4-digit guessable number
// lets anyone enumerate other families' application statuses; 128 bits of
// randomness does not.
function generateTrackingCode() {
  const year = new Date().getFullYear();
  return `RPPS-${year}-${crypto.randomBytes(8).toString('hex')}`;
}

// POST /api/applications - Submit new pupil admission (public)
router.post('/applications', applicationLimiter, (req, res) => {
  try {
    const { parentName, phone, email, childName, grade, notes } = req.body || {};

    if (!parentName || !phone || !childName || !grade) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Parent Name, Phone, Child Name, and Grade Level are required.'
      });
    }

    if (typeof parentName !== 'string' || typeof phone !== 'string' || typeof childName !== 'string' || typeof grade !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid input format.' });
    }

    // Length caps prevent database bloat / abuse via oversized payloads
    if (
      parentName.trim().length > MAX_LEN.parentName ||
      phone.trim().length > MAX_LEN.phone ||
      childName.trim().length > MAX_LEN.childName ||
      grade.trim().length > MAX_LEN.grade ||
      (email && String(email).trim().length > MAX_LEN.email) ||
      (notes && String(notes).trim().length > MAX_LEN.notes)
    ) {
      return res.status(400).json({ success: false, error: 'One or more fields exceed the maximum allowed length.' });
    }

    const trackingCode = generateTrackingCode();

    const stmt = db.prepare(`
      INSERT INTO applications (tracking_code, parent_name, phone, email, child_name, grade, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      trackingCode,
      parentName.trim(),
      phone.trim(),
      email ? String(email).trim() : null,
      childName.trim(),
      grade.trim(),
      notes ? String(notes).trim() : null
    );

    console.log(`📝 New Admission Application Received: ${trackingCode}`);

    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully!',
      trackingCode,
      applicationId: info.lastInsertRowid,
      details: {
        parentName: parentName.trim(),
        childName: childName.trim(),
        grade: grade.trim(),
        status: 'Pending Submission Review'
      }
    });

  } catch (err) {
    console.error('Error saving admission application:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to process application. Please try again later.'
    });
  }
});

// GET /api/applications - List all applications (staff/admin only).
// SECURITY: this exposes children's names, parent phones and emails; it must
// never be served to unauthenticated visitors.
router.get('/applications', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM applications ORDER BY id DESC');
    const list = stmt.all();
    res.json({
      success: true,
      total: list.length,
      applications: list
    });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ success: false, error: 'Database fetch error' });
  }
});

// GET /api/applications/track/:code - Public tracking code lookup for parents
router.get('/applications/track/:code', (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Tracking code is required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const app = db.prepare('SELECT tracking_code, child_name, grade, status, created_at FROM applications WHERE UPPER(tracking_code) = ?').get(cleanCode);

    if (!app) {
      // SECURITY: never reflect the user-supplied code back into the response
      return res.status(404).json({ success: false, error: 'No application found for this tracking code. Please verify your reference number.' });
    }

    res.json({
      success: true,
      application: app
    });
  } catch (err) {
    console.error('Error tracking application:', err);
    res.status(500).json({ success: false, error: 'Failed to look up tracking code.' });
  }
});

// PATCH /api/applications/:id - Update application status (staff/admin only)
router.patch('/applications/:id', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    // Whitelist the status value instead of storing arbitrary client input
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const appId = Number.parseInt(id, 10);
    if (!Number.isInteger(appId)) {
      return res.status(400).json({ success: false, error: 'Invalid application id' });
    }

    const stmt = db.prepare('UPDATE applications SET status = ? WHERE id = ?');
    const result = stmt.run(status, appId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, message: `Application status updated to ${status}` });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// DELETE /api/applications/:id - Delete an application (admin only)
router.delete('/applications/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const appId = Number.parseInt(id, 10);
    if (!Number.isInteger(appId)) {
      return res.status(400).json({ success: false, error: 'Invalid application id' });
    }

    const stmt = db.prepare('DELETE FROM applications WHERE id = ?');
    const result = stmt.run(appId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ success: false, error: 'Failed to delete application' });
  }
});

export default router;
