import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken, optionalAuthenticate, validateAlumniProfile, JWT_SECRET } from './auth.js';

const router = express.Router();

// Rate limiters for abuse-prone endpoints
const messageLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Sending too many messages. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const typingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 150,
  message: { success: false },
  standardHeaders: true,
  legacyHeaders: false,
});

const reactionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: { success: false, error: 'Too many reactions. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const memberRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many registration attempts from this IP address. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Supported Alumni Channels
const VALID_CHANNELS = ['general', 'reunions', 'mentorship', 'memories'];

// Only allow hex colors; anything else falls back to the channel default.
// avatar_color is interpolated directly into a CSS style attribute on the
// client, so it must never contain arbitrary characters.
function sanitizeColor(value, fallback = '#0d5c3a') {
  return typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : fallback;
}

const MAX_MESSAGE_LEN = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Escape LIKE wildcards; queries must pair this with ESCAPE '\'.
function likeTerm(search) {
  return '%' + search.trim().replace(/[\\%_]/g, m => '\\' + m) + '%';
}

// Active Server-Sent Events (SSE) Subscribers for Real-Time Streaming
const sseSubscribers = new Set();

export function broadcastSSE(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseSubscribers) {
    if (client.res.writableEnded || client.res.destroyed) {
      sseSubscribers.delete(client);
      continue;
    }
    try {
      client.res.write(payload);
    } catch (e) {
      sseSubscribers.delete(client);
    }
  }
}

// SECURITY: cap concurrent SSE connections per IP so a single client cannot
// exhaust server file descriptors / memory by opening thousands of streams.
const MAX_SSE_PER_IP = 3;
const sseConnectionsByIp = new Map();

function trackSseConnection(ip, delta) {
  const current = (sseConnectionsByIp.get(ip) || 0) + delta;
  if (current <= 0) {
    sseConnectionsByIp.delete(ip);
  } else {
    sseConnectionsByIp.set(ip, current);
  }
}

// GET /api/alumni/stream - Real-Time Server-Sent Events (SSE) Stream
router.get('/alumni/stream', (req, res) => {
  const clientIp = req.ip || 'unknown';
  if ((sseConnectionsByIp.get(clientIp) || 0) >= MAX_SSE_PER_IP) {
    return res.status(429).json({ success: false, error: 'Too many live connections from this network.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const client = { id: Date.now() + Math.random(), res };
  sseSubscribers.add(client);
  trackSseConnection(clientIp, 1);

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', onlineCount: sseSubscribers.size })}\n\n`);

  // Broadcast updated online count to all clients
  broadcastSSE('online_count', { count: sseSubscribers.size });

  // 20-second heartbeat to keep connection alive across proxies/firewalls
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(heartbeat);
      sseSubscribers.delete(client);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseSubscribers.delete(client);
    trackSseConnection(clientIp, -1);
    broadcastSSE('online_count', { count: sseSubscribers.size });
  });
});

// POST /api/alumni/typing - Broadcast typing indicators to channel participants
// SECURITY: requires authentication; an open endpoint allowed anyone to spoof
// arbitrary names in other users' browsers via SSE.
router.post('/alumni/typing', typingLimiter, authenticateToken, (req, res) => {
  try {
    const { channel = 'general', isTyping = true } = req.body || {};
    if (!VALID_CHANNELS.includes(channel)) {
      return res.status(400).json({ success: false });
    }
    const authorName = req.user.name;
    const authorType = req.user.memberType || 'OB';

    broadcastSSE('typing_status', {
      channel,
      authorName,
      authorType,
      isTyping: Boolean(isTyping)
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET /api/alumni/messages - Fetch messages for alumni chat
router.get('/alumni/messages', (req, res) => {
  try {
    const { channel, search, limit = 100 } = req.query;
    // Cap the page size; also guard against negative LIMIT values (SQLite
    // treats negative LIMIT as "no limit").
    const parsedLimit = Number.parseInt(limit, 10);
    const safeLimit = Number.isInteger(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 500) : 100;

    let query = 'SELECT * FROM alumni_messages';
    const params = [];

    const conditions = [];

    if (typeof channel === 'string' && channel !== 'all') {
      conditions.push('channel = ?');
      params.push(channel);
    }

    if (typeof search === 'string' && search.trim()) {
      conditions.push("(content LIKE ? ESCAPE '\\' OR author_name LIKE ? ESCAPE '\\' OR class_year LIKE ? ESCAPE '\\')");
      const term = likeTerm(search);
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC LIMIT ?';
    params.push(safeLimit);

    const stmt = db.prepare(query);
    const messages = stmt.all(...params);

    res.json({
      success: true,
      total: messages.length,
      messages
    });
  } catch (err) {
    console.error('Error fetching alumni messages:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve messages' });
  }
});

// POST /api/alumni/messages - Post a new message (Requires Alumni or Staff Authentication)
router.post('/alumni/messages', messageLimiter, authenticateToken, (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'alumni' && userRole !== 'staff' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only authenticated RPPS alumni or staff can post messages in this lounge.'
      });
    }

    const { channel = 'general', content } = req.body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content cannot be empty.'
      });
    }

    if (content.trim().length > MAX_MESSAGE_LEN) {
      return res.status(400).json({ success: false, error: `Message cannot exceed ${MAX_MESSAGE_LEN} characters.` });
    }

    // Always trust the verified token identity over client-supplied fields
    const authorName = req.user.name || 'Alumni Member';
    const authorType = (req.user.memberType || 'OB').toUpperCase() === 'OG' ? 'OG' : 'OB';
    const classYear = req.user.classYear || 'Alumni';
    const profession = req.user.profession || '';
    const cleanChannel = VALID_CHANNELS.includes(channel) ? channel : 'general';
    const cleanColor = sanitizeColor(req.user.avatarColor, authorType === 'OB' ? '#0d5c3a' : '#d97706');

    const stmt = db.prepare(`
      INSERT INTO alumni_messages (channel, author_name, author_type, class_year, profession, avatar_color, content, likes_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const info = stmt.run(
      cleanChannel,
      authorName.trim(),
      authorType,
      classYear.trim(),
      profession ? profession.trim() : null,
      cleanColor,
      content.trim()
    );

    const newMessage = db.prepare('SELECT * FROM alumni_messages WHERE id = ?').get(info.lastInsertRowid);

    console.log(`💬 New Alumni Chat: [${authorType}] ${authorName} in #${cleanChannel}: "${content.substring(0, 40)}..."`);

    // Broadcast in real-time to all connected alumni clients
    broadcastSSE('new_message', newMessage);

    res.status(201).json({
      success: true,
      message: 'Message posted successfully',
      data: newMessage
    });
  } catch (err) {
    console.error('Error posting alumni message:', err);
    res.status(500).json({ success: false, error: 'Failed to post message' });
  }
});

// POST /api/alumni/messages/:id/react - Like/Cheer a message
router.post('/alumni/messages/:id/react', reactionLimiter, authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const msgId = Number.parseInt(id, 10);
    if (!Number.isInteger(msgId)) {
      return res.status(400).json({ success: false, error: 'Invalid message id.' });
    }
    const stmt = db.prepare('UPDATE alumni_messages SET likes_count = likes_count + 1 WHERE id = ?');
    const result = stmt.run(msgId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const updated = db.prepare('SELECT id, likes_count FROM alumni_messages WHERE id = ?').get(msgId);

    // Broadcast reaction update in real-time to all connected alumni clients
    broadcastSSE('reaction_update', {
      messageId: msgId,
      likesCount: updated.likes_count
    });

    res.json({
      success: true,
      likesCount: updated.likes_count
    });
  } catch (err) {
    console.error('Error reacting to message:', err);
    res.status(500).json({ success: false, error: 'Failed to update reaction' });
  }
});

// GET /api/alumni/channels - Channel list with stats
router.get('/alumni/channels', (req, res) => {
  try {
    const channels = [
      { id: 'general', name: 'General Lounge', icon: '💬', desc: 'Catching up, greetings & daily chatter' },
      { id: 'reunions', name: 'Reunions & Events', icon: '🤝', desc: 'Upcoming get-togethers, sports days & visits' },
      { id: 'mentorship', name: 'Careers & Mentorship', icon: '💼', desc: 'Guiding pupils, internships & networking' },
      { id: 'memories', name: 'School Memories', icon: '🏆', desc: 'Throwback moments, nostalgia & teacher appreciation' }
    ];

    const counts = db.prepare(`
      SELECT channel, COUNT(*) as count 
      FROM alumni_messages 
      GROUP BY channel
    `).all();

    const countMap = {};
    counts.forEach(row => { countMap[row.channel] = row.count; });

    const enriched = channels.map(ch => ({
      ...ch,
      messageCount: countMap[ch.id] || 0
    }));

    res.json({ success: true, channels: enriched });
  } catch (err) {
    console.error('Error getting channels:', err);
    res.status(500).json({ success: false, error: 'Failed to get channels' });
  }
});

// GET /api/alumni/members - Directory of Old Boys and Old Girls (Masks private contacts for public guests)
router.get('/alumni/members', optionalAuthenticate, (req, res) => {
  try {
    const { type, search } = req.query;
    let query = 'SELECT * FROM alumni_members';
    const params = [];
    const conditions = [];

    if (type && (type === 'OB' || type === 'OG')) {
      conditions.push('member_type = ?');
      params.push(type);
    }

    if (search && typeof search === 'string' && search.trim()) {
      conditions.push("(name LIKE ? ESCAPE '\\' OR class_year LIKE ? ESCAPE '\\' OR profession LIKE ? ESCAPE '\\' OR location LIKE ? ESCAPE '\\')");
      // Escape LIKE wildcards so a user can't probe the whole table with '%'
      const term = likeTerm(search);
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC';

    const members = db.prepare(query).all(...params);

    const obCount = db.prepare("SELECT COUNT(*) as count FROM alumni_members WHERE member_type = 'OB'").get().count;
    const ogCount = db.prepare("SELECT COUNT(*) as count FROM alumni_members WHERE member_type = 'OG'").get().count;

    // RBAC: Check if user is authenticated as alumni, staff, or admin
    const isAuthorizedAlumniOrStaff = Boolean(req.user && (req.user.role === 'alumni' || req.user.role === 'staff' || req.user.role === 'admin'));

    // Sanitize records if visitor / unauthenticated parent
    const processedMembers = members.map(m => {
      if (isAuthorizedAlumniOrStaff) {
        return {
          ...m,
          isContactMasked: false
        };
      }
      return {
        ...m,
        email: null,
        phone: null,
        isContactMasked: true
      };
    });

    res.json({
      success: true,
      isAuthorized: isAuthorizedAlumniOrStaff,
      total: processedMembers.length,
      stats: { obCount, ogCount, totalCount: obCount + ogCount },
      members: processedMembers
    });
  } catch (err) {
    console.error('Error fetching alumni directory:', err);
    res.status(500).json({ success: false, error: 'Failed to load directory' });
  }
});

// POST /api/alumni/members - Register in Alumni Network (with optional password for instant account creation)
router.post('/alumni/members', memberRegisterLimiter, (req, res) => {
  try {
    const { name, email, phone, memberType, classYear, profession, location, bio, password } = req.body || {};

    if (!name || !memberType || !classYear) {
      return res.status(400).json({
        success: false,
        error: 'Name, member type (OB/OG), and class year are required.'
      });
    }

    const profileError = validateAlumniProfile({ name, memberType, classYear, profession, location, phone, bio });
    if (profileError) {
      return res.status(400).json({ success: false, error: profileError });
    }

    if (email && (typeof email !== 'string' || email.trim().length > 200 || !EMAIL_RE.test(email.trim()))) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const cleanType = memberType.toUpperCase() === 'OG' ? 'OG' : 'OB';
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    // If a password is provided, an account is created; enforce the policy.
    if (password && (typeof password !== 'string' || password.length < 8 || password.length > 128)) {
      return res.status(400).json({ success: false, error: 'Password must be between 8 and 128 characters long.' });
    }

    const stmt = db.prepare(`
      INSERT INTO alumni_members (name, email, phone, member_type, class_year, profession, location, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      cleanEmail,
      phone ? phone.trim() : null,
      cleanType,
      classYear.trim(),
      profession ? profession.trim() : null,
      location ? location.trim() : null,
      bio ? bio.trim() : null
    );

    const newMember = db.prepare('SELECT * FROM alumni_members WHERE id = ?').get(result.lastInsertRowid);

    console.log(`🎓 New Alumni Member Registered: [${cleanType}] ${name} (${classYear})`);

    let token = null;
    let userObj = null;

    // If password provided and email exists, also create a login user account
    if (password && cleanEmail) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      if (!existingUser) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const userInsert = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
        const uInfo = userInsert.run(name.trim(), cleanEmail, hash, 'alumni');
        
        userObj = {
          id: uInfo.lastInsertRowid,
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

        token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '14d' });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Welcome to the RPPS OBs & OGs Alumni Network!',
      member: newMember,
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Error registering alumni:', err);
    res.status(500).json({ success: false, error: 'Failed to register alumni member' });
  }
});

export default router;
