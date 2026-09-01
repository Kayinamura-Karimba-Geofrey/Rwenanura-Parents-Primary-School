import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import admissionsRouter from './routes/admissions.js';
import newsletterRouter from './routes/newsletter.js';
import newsRouter from './routes/news.js';
import authRouter from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/api', authRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Rwenanura Parents Primary School API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if dist directory exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Express Backend
app.listen(PORT, () => {
  console.log(`🚀 RPPS Unified Express & Frontend Server running on http://localhost:${PORT}`);
});

