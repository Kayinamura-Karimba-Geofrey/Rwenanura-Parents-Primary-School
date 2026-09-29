import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken, optionalAuthenticate, JWT_SECRET } from './auth.js';

const router = express.Router();

// Supported Alumni Channels
const VALID_CHANNELS = ['general', 'reunions', 'mentorship', 'memories'];

// Active Server-Sent Events (SSE) Subscribers for Real-Time Streaming
const sseSubscribers = new Set();

export function broadcastSSE(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseSubscribers) {
    try {
      client.res.write(payload);
    } catch (e) {
      sseSubscribers.delete(client);
    }
  }
}

// GET /api/alumni/stream - Real-Time Server-Sent Events (SSE) Stream
router.get('/alumni/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const client = { id: Date.now() + Math.random(), res };
  sseSubscribers.add(client);

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
    broadcastSSE('online_count', { count: sseSubscribers.size });
  });
});

// POST /api/alumni/typing - Broadcast typing indicators to channel participants
router.post('/alumni/typing', optionalAuthenticate, (req, res) => {
  try {
    const { channel = 'general', isTyping = true } = req.body;
    const authorName = req.user ? req.user.name : (req.body.authorName || 'An Alumnus');
    const authorType = req.user ? (req.user.memberType || 'OB') : (req.body.authorType || 'OB');

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

    let query = 'SELECT * FROM alumni_messages';
    const params = [];

    const conditions = [];

    if (channel && channel !== 'all') {
      conditions.push('channel = ?');
      params.push(channel);
    }

    if (search && search.trim()) {
      conditions.push('(content LIKE ? OR author_name LIKE ? OR class_year LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC LIMIT ?';
    params.push(Number(limit) || 100);

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
router.post('/alumni/messages', authenticateToken, (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'alumni' && userRole !== 'staff' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only authenticated RPPS alumni or staff can post messages in this lounge.'
      });
    }

    const { channel = 'general', content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content cannot be empty.'
      });
    }

    // Default to verified user token identity to prevent spoofing
    const authorName = req.user.name || req.body.authorName || 'Alumni Member';
    const authorType = (req.user.memberType || req.body.authorType || 'OB').toUpperCase() === 'OG' ? 'OG' : 'OB';
    const classYear = req.user.classYear || req.body.classYear || 'Alumni';
    const profession = req.user.profession || req.body.profession || '';
    const cleanChannel = VALID_CHANNELS.includes(channel) ? channel : 'general';
    const cleanColor = req.user.avatarColor || req.body.avatarColor || (authorType === 'OB' ? '#0d5c3a' : '#d97706');

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
router.post('/alumni/messages/:id/react', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE alumni_messages SET likes_count = likes_count + 1 WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const updated = db.prepare('SELECT id, likes_count FROM alumni_messages WHERE id = ?').get(id);

    // Broadcast reaction update in real-time to all connected alumni clients
    broadcastSSE('reaction_update', {
      messageId: Number(id),
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

    if (search && search.trim()) {
      conditions.push('(name LIKE ? OR class_year LIKE ? OR profession LIKE ? OR location LIKE ?)');
      const term = `%${search.trim()}%`;
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
router.post('/alumni/members', (req, res) => {
  try {
    const { name, email, phone, memberType, classYear, profession, location, bio, password } = req.body;

    if (!name || !memberType || !classYear) {
      return res.status(400).json({
        success: false,
        error: 'Name, member type (OB/OG), and class year are required.'
      });
    }

    const cleanType = memberType.toUpperCase() === 'OG' ? 'OG' : 'OB';
    const cleanEmail = email ? email.trim().toLowerCase() : null;

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
