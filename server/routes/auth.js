import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import db from '../db.js';

const router = express.Router();
export const JWT_SECRET = process.env.JWT_SECRET || 'rwenanura-secret-key-2026';

// Rate Limiter for Login Attempts (Max 10 attempts per 15 mins)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts from this IP address. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to verify JWT token
// Middleware to optionally verify JWT token without rejecting guests
export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
}

// Middleware to strictly verify JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired session token.' });
    }
    req.user = decoded;
    next();
  });
}

// POST /api/auth/alumni-register - Register new Alumni account
router.post('/auth/alumni-register', (req, res) => {
  try {
    const { name, email, password, memberType, classYear, profession, location, phone, bio } = req.body;

    if (!name || !email || !password || !memberType || !classYear) {
      return res.status(400).json({ 
        success: false, 
        error: 'Full name, email, password, alumni type (OB/OG), and graduating class year are required.' 
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanType = memberType.toUpperCase() === 'OG' ? 'OG' : 'OB';

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists. Please log in.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // 1. Create User account with role 'alumni'
    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const userInfo = insertUser.run(name.trim(), cleanEmail, passwordHash, 'alumni');
    const userId = userInfo.lastInsertRowid;

    // 2. Insert or update into alumni_members directory
    const existingMember = db.prepare('SELECT id FROM alumni_members WHERE email = ?').get(cleanEmail);
    if (existingMember) {
      db.prepare(`
        UPDATE alumni_members 
        SET name = ?, phone = ?, member_type = ?, class_year = ?, profession = ?, location = ?, bio = ?
        WHERE id = ?
      `).run(
        name.trim(),
        phone ? phone.trim() : null,
        cleanType,
        classYear.trim(),
        profession ? profession.trim() : null,
        location ? location.trim() : null,
        bio ? bio.trim() : null,
        existingMember.id
      );
    } else {
      db.prepare(`
        INSERT INTO alumni_members (name, email, phone, member_type, class_year, profession, location, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        name.trim(),
        cleanEmail,
        phone ? phone.trim() : null,
        cleanType,
        classYear.trim(),
        profession ? profession.trim() : null,
        location ? location.trim() : null,
        bio ? bio.trim() : null
      );
    }

    const userObj = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      role: 'alumni',
      memberType: cleanType,
      classYear: classYear.trim(),
      profession: profession ? profession.trim() : '',
      location: location ? location.trim() : '',
      phone: phone ? phone.trim() : '',
      bio: bio ? bio.trim() : '',
      avatarColor: cleanType === 'OB' ? '#0d5c3a' : '#d97706'
    };

    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '14d' });

    console.log(`🎓 New Alumni Registered & Logged In: [${cleanType}] ${name} (${cleanEmail})`);

    res.status(201).json({
      success: true,
      message: 'Welcome to the RPPS OBs & OGs Alumni Network!',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Alumni register error:', err);
    res.status(500).json({ success: false, error: 'Failed to create alumni account.' });
  }
});

// POST /api/auth/signup - Register new staff account
router.post('/auth/signup', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userRole = role === 'admin' ? 'admin' : (role === 'alumni' ? 'alumni' : 'staff');

    const stmt = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name.trim(), cleanEmail, passwordHash, userRole);

    const userId = info.lastInsertRowid;
    const userObj = { id: userId, name: name.trim(), email: cleanEmail, role: userRole };

    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });

    console.log(`👤 New User Registered: ${name} (${cleanEmail}) [${userRole}]`);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: userObj
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Failed to create user account.' });
  }
});

// POST /api/auth/login - Authenticate staff/admin/alumni
router.post('/auth/login', loginLimiter, (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    let extraData = {};
    if (user.role === 'alumni') {
      const member = db.prepare('SELECT * FROM alumni_members WHERE email = ?').get(cleanEmail);
      if (member) {
        extraData = {
          memberType: member.member_type,
          classYear: member.class_year,
          profession: member.profession || '',
          location: member.location || '',
          phone: member.phone || '',
          bio: member.bio || '',
          avatarColor: member.member_type === 'OB' ? '#0d5c3a' : '#d97706'
        };
      }
    }

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...extraData
    };

    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '14d' });

    console.log(`🔐 User Logged In: ${user.name} (${user.email}) [${user.role}]`);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userObj
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server authentication error.' });
  }
});

// GET /api/auth/me - Fetch current authenticated user
router.get('/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    let extraData = {};
    if (user.role === 'alumni') {
      const member = db.prepare('SELECT * FROM alumni_members WHERE email = ?').get(user.email);
      if (member) {
        extraData = {
          memberType: member.member_type,
          classYear: member.class_year,
          profession: member.profession || '',
          location: member.location || '',
          phone: member.phone || '',
          bio: member.bio || '',
          avatarColor: member.member_type === 'OB' ? '#0d5c3a' : '#d97706'
        };
      }
    }

    res.json({
      success: true,
      user: { ...user, ...extraData }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
