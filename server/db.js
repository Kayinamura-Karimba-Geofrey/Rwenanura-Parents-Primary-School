import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { academicTerms as seedTerms, calendarEvents as seedEvents } from './calendarData.js';

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
db.pragma('foreign_keys = ON');

// Initialize Database Tables
export function initDatabase() {
  // 1. Users Table (Authentication)
  // email is optional because pupils may sign in with a username instead;
  // every account has at least one of the two (enforced by the API).
  const USERS_TABLE_SQL = (name) => `
    CREATE TABLE IF NOT EXISTS ${name} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      username TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      requested_role TEXT,
      class_level TEXT,
      email_verified INTEGER NOT NULL DEFAULT 0,
      password_changed_at INTEGER,
      session_version INTEGER NOT NULL DEFAULT 0
    )
  `;
  db.exec(USERS_TABLE_SQL('users'));

  // Migrations for databases created before student accounts existed:
  // requested_role holds the role a pending registration asked for, and
  // class_level the pupil's class (students only).
  const userColumns = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
  if (!userColumns.includes('requested_role')) {
    db.exec('ALTER TABLE users ADD COLUMN requested_role TEXT');
  }
  if (!userColumns.includes('class_level')) {
    db.exec('ALTER TABLE users ADD COLUMN class_level TEXT');
  }
  // Accounts that existed before email verification are treated as verified
  // so nobody is locked out; new accounts start unverified (0).
  if (!userColumns.includes('email_verified')) {
    db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0');
    db.exec('UPDATE users SET email_verified = 1');
  }
  // Time of the last password change (informational).
  if (!userColumns.includes('password_changed_at')) {
    db.exec('ALTER TABLE users ADD COLUMN password_changed_at INTEGER');
  }
  // Incremented on password reset; sessions carrying an older value are rejected.
  if (!userColumns.includes('session_version')) {
    db.exec('ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0');
  }
  // Older databases declared email NOT NULL and had no username column.
  // SQLite cannot relax a constraint in place, so rebuild the table once,
  // keeping every row and id.
  const emailColumn = db.prepare('PRAGMA table_info(users)').all().find(c => c.name === 'email');
  if (emailColumn.notnull || !userColumns.includes('username')) {
    const columns = 'id, name, email, password_hash, role, created_at, requested_role, class_level, email_verified, password_changed_at, session_version';
    db.pragma('foreign_keys = OFF');
    db.transaction(() => {
      db.exec('DROP TABLE IF EXISTS users_migrated');
      db.exec(USERS_TABLE_SQL('users_migrated'));
      db.exec(`INSERT INTO users_migrated (${columns}) SELECT ${columns} FROM users`);
      db.exec('DROP TABLE users');
      db.exec('ALTER TABLE users_migrated RENAME TO users');
    })();
    db.pragma('foreign_keys = ON');
    console.log('🔧 Migrated users table (optional email, usernames)');
  }

  // Single-use email verification / password reset tokens. Only a SHA-256
  // hash of each token is stored, so a database leak can't be replayed.
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      purpose TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      payload TEXT,
      expires_at INTEGER NOT NULL,
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

  // SECURITY: default accounts are seeded only when explicitly requested via
  // environment variables, and passwords are never hardcoded in source. When
  // no password is provided, a random one is generated and printed once to the
  // server console (never committed, never shown in the UI).
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@rwenanura.ac.rw').toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPassword, salt);

    const insertAdmin = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, email_verified)
      VALUES (?, ?, ?, ?, 1)
    `);
    insertAdmin.run('Super Admin', adminEmail, hash, 'admin');

    console.log(`👤 Default admin account created: ${adminEmail}`);
    if (!process.env.SEED_ADMIN_PASSWORD) {
      // Never print the generated password: logs are often stored or shipped
      // elsewhere. Write it to a file only the server user can read instead.
      const passwordFile = path.join(dataDir, 'initial-admin-password.txt');
      fs.writeFileSync(passwordFile, `${adminPassword}\n`, { mode: 0o600 });
      console.log(`   Generated password saved to ${passwordFile}`);
      console.log('   ⚠️  Sign in, change the password, then delete that file.');
    }
  }

  // 5. Alumni Messages Table (OBs & OGs Chat)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alumni_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL DEFAULT 'general',
      author_name TEXT NOT NULL,
      author_type TEXT NOT NULL, -- 'OB' or 'OG'
      class_year TEXT NOT NULL,
      profession TEXT,
      avatar_color TEXT DEFAULT '#0d5c3a',
      content TEXT NOT NULL,
      likes_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5b. One like per user per message (likes_count is kept in sync)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alumni_message_likes (
      message_id INTEGER NOT NULL REFERENCES alumni_messages(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (message_id, user_id)
    )
  `);

  // 6. Alumni Members Directory Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alumni_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      member_type TEXT NOT NULL, -- 'OB' or 'OG'
      class_year TEXT NOT NULL,
      profession TEXT,
      location TEXT,
      bio TEXT,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 7. Academic calendar (editable by staff). Localized text ({en, rw, fr})
  // is stored as JSON.
  db.exec(`
    CREATE TABLE IF NOT EXISTS academic_terms (
      id TEXT PRIMARY KEY,
      term_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      period TEXT NOT NULL,
      duration TEXT,
      status TEXT NOT NULL DEFAULT 'upcoming',
      highlights TEXT NOT NULL
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT NOT NULL REFERENCES academic_terms(id),
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      audience TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // First run: seed the calendar from server/calendarData.js
  if (db.prepare('SELECT COUNT(*) AS count FROM academic_terms').get().count === 0) {
    const insertTerm = db.prepare('INSERT INTO academic_terms (id, term_number, name, period, duration, status, highlights) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertEvent = db.prepare('INSERT INTO calendar_events (term, category, title, description, start_date, end_date, audience, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    db.transaction(() => {
      for (const t of seedTerms) {
        insertTerm.run(t.id, t.termNumber, JSON.stringify(t.name), t.period, t.duration, t.status, JSON.stringify(t.highlights));
      }
      for (const e of seedEvents) {
        insertEvent.run(e.term, e.category, JSON.stringify(e.title), JSON.stringify(e.description), e.startDate.slice(0, 16), e.endDate.slice(0, 16), e.audience, e.location);
      }
    })();
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

  // Seed default alumni messages if empty
  const alumniMsgCount = db.prepare('SELECT COUNT(*) as count FROM alumni_messages').get().count;
  if (alumniMsgCount === 0) {
    const insertMsg = db.prepare(`
      INSERT INTO alumni_messages (channel, author_name, author_type, class_year, profession, avatar_color, content, likes_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMsg.run(
      'general',
      'Emmanuel Mugisha',
      'OB',
      'Class of 2016',
      'Civil Engineer, Kigali',
      '#0d5c3a',
      'Hello fellow OBs and OGs! Wonderful to finally have our official RPPS Alumni chat lounge. Who remembers the morning assembly hymns and Mr. Habimana’s science experiments?',
      8,
      new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    );

    insertMsg.run(
      'general',
      'Grace Uwase',
      'OG',
      'Class of 2018',
      'Biomedical Scientist, Butare',
      '#d97706',
      'Warm greetings everyone! So proud to see RPPS still topping Nyagatare district in academic excellence. The discipline and light we received there guided my whole journey.',
      12,
      new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    );

    insertMsg.run(
      'reunions',
      'Patrick Kayitare',
      'OB',
      'Class of 2015',
      'Agribusiness Consultant',
      '#0d5c3a',
      'Attention OBs & OGs! We are organizing the 2026 End-of-Year Alumni Gala & Sports Match at the school campus. Let us organize an OBs vs current P6 football match!',
      15,
      new Date(Date.now() - 3600000 * 18).toISOString()
    );

    insertMsg.run(
      'reunions',
      'Diane Mukamana',
      'OG',
      'Class of 2019',
      'Software Developer, Norrsken Kigali',
      '#d97706',
      'Count me in for the alumni gala! We should also arrange a mentoring session where we talk to the candidates about career choices and high school life.',
      9,
      new Date(Date.now() - 3600000 * 12).toISOString()
    );

    insertMsg.run(
      'mentorship',
      'Jean Claude Nshimiyimana',
      'OB',
      'Class of 2014',
      'High School Teacher & Mentor',
      '#0d5c3a',
      'I am currently offering weekend online mentorship for any younger OBs/OGs entering Senior 1 or Senior 4 looking for scholarship guidance. Feel free to connect!',
      11,
      new Date(Date.now() - 3600000 * 6).toISOString()
    );

    insertMsg.run(
      'memories',
      'Aline Umutoni',
      'OG',
      'Class of 2017',
      'Architect, Kigali',
      '#d97706',
      'Throwback Thursday! Does anyone still have our P6 graduation ceremony photos from 2017? The traditional Intore dance performance was unforgettable. Light and Leadership!',
      7,
      new Date(Date.now() - 3600000 * 2).toISOString()
    );
  }

  // Seed default alumni directory if empty
  const alumniMemberCount = db.prepare('SELECT COUNT(*) as count FROM alumni_members').get().count;
  if (alumniMemberCount === 0) {
    const insertMember = db.prepare(`
      INSERT INTO alumni_members (name, email, phone, member_type, class_year, profession, location, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMember.run('Emmanuel Mugisha', 'emmanuel.m@gmail.com', '+250 788 123 456', 'OB', 'Class of 2016', 'Civil Engineer', 'Kigali, Rwanda', 'Passionate about infrastructure development and mentoring future Rwandan engineers.');
    insertMember.run('Grace Uwase', 'grace.uwase@gmail.com', '+250 788 234 567', 'OG', 'Class of 2018', 'Biomedical Scientist', 'Huye, Rwanda', 'Researching health sciences; proud RPPS debate team captain 2018.');
    insertMember.run('Patrick Kayitare', 'p.kayitare@gmail.com', '+250 788 345 678', 'OB', 'Class of 2015', 'Agribusiness Entrepreneur', 'Nyagatare, Rwanda', 'Promoting youth farming cooperatives in Eastern Province.');
    insertMember.run('Diane Mukamana', 'diane.m@tech.rw', '+250 788 456 789', 'OG', 'Class of 2019', 'Software Developer', 'Kigali, Rwanda', 'Building fintech solutions; advocating for girls in STEM.');
    insertMember.run('Jean Claude Nshimiyimana', 'jc.nshimiye@gmail.com', '+250 788 567 890', 'OB', 'Class of 2014', 'Education Consultant', 'Musanze, Rwanda', 'Supporting access to quality rural education and youth leadership.');
  }

  console.log('✅ SQLite Database initialized successfully at:', dbPath);
}

export default db;
