import express from 'express';
import db from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Helper to generate unique tracking code
function generateTrackingCode() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RPPS-${year}-${randomNum}`;
}

// POST /api/applications - Submit new pupil admission
router.post('/applications', (req, res) => {
  try {
    const { parentName, phone, email, childName, grade, notes } = req.body;

    if (!parentName || !phone || !childName || !grade) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Parent Name, Phone, Child Name, and Grade Level are required.'
      });
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
      email ? email.trim() : null,
      childName.trim(),
      grade.trim(),
      notes ? notes.trim() : null
    );

    console.log(`📝 New Admission Application Received: ${trackingCode} for ${childName} (${grade})`);

    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully!',
      trackingCode,
      applicationId: info.lastInsertRowid,
      details: {
        parentName,
        childName,
        grade,
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

// GET /api/applications - List all applications (for school staff review)
router.get('/applications', (req, res) => {
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
      return res.status(404).json({ success: false, error: `No application found for tracking code "${cleanCode}". Please verify your reference number.` });
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

// PATCH /api/applications/:id - Update application status (Protected)
router.patch('/applications/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const stmt = db.prepare('UPDATE applications SET status = ? WHERE id = ?');
    const result = stmt.run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, message: `Application status updated to ${status}` });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// DELETE /api/applications/:id - Delete an application (Protected)
router.delete('/applications/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM applications WHERE id = ?');
    const result = stmt.run(id);

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
