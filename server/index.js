import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import admissionsRouter from './routes/admissions.js';
import newsletterRouter from './routes/newsletter.js';
import newsRouter from './routes/news.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Tables
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', admissionsRouter);
app.use('/api', newsletterRouter);
app.use('/api', newsRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Rwenanura Parents Primary School API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start Express Backend
app.listen(PORT, () => {
  console.log(`🚀 RPPS Express Backend Server running on http://localhost:${PORT}`);
});
