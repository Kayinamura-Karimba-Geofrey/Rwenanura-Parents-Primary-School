import express from 'express';
import db from '../db.js';

const router = express.Router();

// Supported Alumni Channels
const VALID_CHANNELS = ['general', 'reunions', 'mentorship', 'memories'];

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

// POST /api/alumni/messages - Post a new message
router.post('/alumni/messages', (req, res) => {
  try {
    const { channel = 'general', authorName, authorType, classYear, profession, avatarColor, content } = req.body;

    if (!authorName || !content || !authorType || !classYear) {
      return res.status(400).json({
        success: false,
        error: 'Author name, type (OB/OG), graduation class year, and message content are required.'
      });
    }

    const cleanChannel = VALID_CHANNELS.includes(channel) ? channel : 'general';
    const cleanType = authorType.toUpperCase() === 'OG' ? 'OG' : 'OB';
    const cleanColor = avatarColor || (cleanType === 'OB' ? '#1e40af' : '#be185d');

    const stmt = db.prepare(`
      INSERT INTO alumni_messages (channel, author_name, author_type, class_year, profession, avatar_color, content, likes_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const info = stmt.run(
      cleanChannel,
      authorName.trim(),
      cleanType,
      classYear.trim(),
      profession ? profession.trim() : null,
      cleanColor,
      content.trim()
    );

    const newMessage = db.prepare('SELECT * FROM alumni_messages WHERE id = ?').get(info.lastInsertRowid);

    console.log(`💬 New Alumni Chat: [${cleanType}] ${authorName} in #${cleanChannel}: "${content.substring(0, 40)}..."`);

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

// GET /api/alumni/members - Directory of Old Boys and Old Girls
router.get('/alumni/members', (req, res) => {
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

    res.json({
      success: true,
      total: members.length,
      stats: { obCount, ogCount, totalCount: obCount + ogCount },
      members
    });
  } catch (err) {
    console.error('Error fetching alumni directory:', err);
    res.status(500).json({ success: false, error: 'Failed to load directory' });
  }
});

// POST /api/alumni/members - Register in Alumni Network
router.post('/api/alumni/members', (req, res) => {
  try {
    const { name, email, phone, memberType, classYear, profession, location, bio } = req.body;

    if (!name || !memberType || !classYear) {
      return res.status(400).json({
        success: false,
        error: 'Name, member type (OB/OG), and class year are required.'
      });
    }

    const cleanType = memberType.toUpperCase() === 'OG' ? 'OG' : 'OB';

    const stmt = db.prepare(`
      INSERT INTO alumni_members (name, email, phone, member_type, class_year, profession, location, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      email ? email.trim() : null,
      phone ? phone.trim() : null,
      cleanType,
      classYear.trim(),
      profession ? profession.trim() : null,
      location ? location.trim() : null,
      bio ? bio.trim() : null
    );

    const newMember = db.prepare('SELECT * FROM alumni_members WHERE id = ?').get(result.lastInsertRowid);

    console.log(`🎓 New Alumni Member Registered: [${cleanType}] ${name} (${classYear})`);

    res.status(201).json({
      success: true,
      message: 'Welcome to the RPPS OBs & OGs Alumni Network!',
      member: newMember
    });
  } catch (err) {
    console.error('Error registering alumni:', err);
    res.status(500).json({ success: false, error: 'Failed to register alumni member' });
  }
});

export default router;
