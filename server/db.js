import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize Database Tables
export function initDatabase() {
  // 1. Users Table (Authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Applications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_code TEXT UNIQUE NOT NULL,
      parent_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      child_name TEXT NOT NULL,
      grade TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Newsletter Subscribers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. News & Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS news_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      day_str TEXT NOT NULL,
      month_str TEXT NOT NULL,
      year_str TEXT NOT NULL,
      time_str TEXT NOT NULL,
      location TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default admin user if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const adminEmail = 'admin@rwenanura.ac.rw';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Admin@2026', salt);

    const insertAdmin = db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `);
    insertAdmin.run('Super Admin', adminEmail, hash, 'admin');
    console.log('👤 Default Admin Account Created: admin@rwenanura.ac.rw / Admin@2026');
  }

  // Seed default news if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM news_events').get().count;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO news_events (title, type, category, day_str, month_str, year_str, time_str, location, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      'Annual STEM & Science Discovery Fair 2026',
      'event',
      'Academic',
      '15', 'SEP', '2026',
      '08:30 AM - 02:00 PM',
      'School Main Hall',
      'Pupils from P1 to P6 present innovative science models, environmental projects, and coding demonstrations.'
    );

    insert.run(
      'RPPS Top Ranked in District Mock PLE Examinations',
      'news',
      'Achievement',
      '02', 'SEP', '2026',
      'All Day',
      'Nyagatare District',
      'Our Primary 6 candidates scored 100% first grade passes in the recent regional pre-national examination series.'
    );

    insert.run(
      'Inter-House Sports & Cultural Competition',
      'event',
      'Community',
      '28', 'SEP', '2026',
      '09:00 AM - 01:00 PM',
      'Sports Stadium',
      'A thrilling day of track events, relay races, traditional Rwandan dance, and athletics.'
    );
  }

  console.log('✅ SQLite Database initialized successfully at:', dbPath);
}

export default db;
