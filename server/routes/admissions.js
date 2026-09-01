import express from 'express';
import db from '../db.js';

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
      INSERT INTO applications (tracking_code, parent_name, phone, email, child_name, grade, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const info = stmt.run(
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
  }
});

export default router;
