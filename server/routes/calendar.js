import express from 'express';
import { authenticateToken, requireRole } from './auth.js';
import { academicTerms, calendarEvents } from '../calendarData.js';

const router = express.Router();

// GET /api/calendar - School calendar (signed-in students, staff and admins only)
router.get('/calendar', authenticateToken, requireRole('student', 'staff', 'admin'), (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.json({
    success: true,
    terms: academicTerms,
    events: calendarEvents
  });
});

export default router;
