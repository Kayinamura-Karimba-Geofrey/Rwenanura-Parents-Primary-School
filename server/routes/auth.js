import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import db from '../db.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendAccountApprovedEmail } from '../mailer.js';

const router = express.Router();

// SECURITY: JWT secret must be provided via environment. Refuse to boot with a
// known/predictable secret, otherwise tokens can be forged by anyone who reads
// the source code.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32 || /your_jwt_secret|secret-key|change/i.test(JWT_SECRET)) {
  console.error('❌ FATAL: Refusing to start. Set a strong JWT_SECRET (32+ random chars) in the .env file.');
  process.exit(1);
}

export { JWT_SECRET };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only HS256 is ever issued; pinning it prevents algorithm-confusion attacks.
const JWT_VERIFY_OPTIONS = { algorithms: ['HS256'] };

// bcrypt only uses the first 72 bytes; also caps hashing cost per request.
const MAX_PASSWORD_LEN = 128;
const MAX_NAME_LEN = 120;
const MAX_EMAIL_LEN = 200;

// Real hash of a random value, used to equalize login timing for unknown emails.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= MAX_PASSWORD_LEN;
}

function isValidEmail(email) {
  return typeof email === 'string' && email.trim().length <= MAX_EMAIL_LEN && EMAIL_RE.test(email.trim());
}

function isValidName(name) {
  return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= MAX_NAME_LEN;
}

const ALUMNI_FIELD_LIMITS = { name: 120, classYear: 40, profession: 120, location: 120, phone: 30, bio: 600 };

// Shared validation for alumni profile fields (account + directory signups).
// Returns an error message, or null when the input is acceptable.
export function validateAlumniProfile(fields) {
  if (typeof fields.memberType !== 'string' || !['OB', 'OG'].includes(fields.memberType.toUpperCase())) {
    return 'Member type must be OB or OG.';
  }
  for (const [key, max] of Object.entries(ALUMNI_FIELD_LIMITS)) {
    const value = fields[key];
    if (value == null || value === '') continue;
    if (typeof value !== 'string' || value.trim().length > max) {
      return `${key} must be text of at most ${max} characters.`;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Single-use email tokens (verification / password reset)
// ---------------------------------------------------------------------------
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Issue a fresh token, replacing any earlier one for the same purpose.
function issueToken(userId, purpose, ttlMs, payload = null) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('DELETE FROM auth_tokens WHERE user_id = ? AND purpose = ?').run(userId, purpose);
  db.prepare('INSERT INTO auth_tokens (user_id, purpose, token_hash, payload, expires_at) VALUES (?, ?, ?, ?, ?)')
    .run(userId, purpose, hashToken(token), payload ? JSON.stringify(payload) : null, Date.now() + ttlMs);
  return token;
}

// Look up and delete (consume) a token; returns the row or null if invalid/expired.
function consumeToken(token, purpose) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 100) return null;
  const row = db.prepare('SELECT * FROM auth_tokens WHERE token_hash = ? AND purpose = ?').get(hashToken(token), purpose);
  if (!row) return null;
  db.prepare('DELETE FROM auth_tokens WHERE id = ?').run(row.id);
  return row.expires_at >= Date.now() ? row : null;
}

function startEmailVerification(userId, email, name, payload = null) {
  const token = issueToken(userId, 'verify', VERIFY_TOKEN_TTL_MS, payload);
  sendVerificationEmail(email, name, token);
}

// Re-read the account on every authenticated request so deleted accounts and
// role changes (approval, demotion) take effect immediately instead of when
// the 14-day token expires.
function attachLiveUser(req, decoded) {
  const dbUser = db.prepare('SELECT id, name, email, role, session_version FROM users WHERE id = ?').get(decoded.id);
  if (!dbUser || dbUser.role === 'pending') return false;
  // Sessions from before the last password reset carry an older version.
  if ((decoded.sv ?? 0) !== dbUser.session_version) return false;
  req.user = { ...decoded, name: dbUser.name, email: dbUser.email, role: dbUser.role };
  return true;
}

// Rate limiter for login: 10 *failed* attempts per 15 minutes per IP.
// Successful logins don't count, because a whole classroom of pupils shares
// one school IP address and must all be able to sign in.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Too many login attempts from this IP address. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit account creation to slow automated abuse
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many registration attempts from this IP address. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------------------------------------------------------
// Session cookie
// The JWT lives in an httpOnly cookie so page scripts (and therefore any
// injected script) can never read it. SameSite=Strict keeps other sites from
// sending it; index.js additionally requires a custom header on writes.
// ---------------------------------------------------------------------------
export const SESSION_COOKIE = 'rpps_session';
const SESSION_TTL_SECONDS = 14 * 24 * 60 * 60;

function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq !== -1 && part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

function cookieAttributes(maxAgeSeconds) {
  return [
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`,
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ');
}

function startSession(res, userObj, sessionVersion) {
  const token = jwt.sign({ ...userObj, sv: sessionVersion }, JWT_SECRET, { expiresIn: SESSION_TTL_SECONDS });
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; ${cookieAttributes(SESSION_TTL_SECONDS)}`);
}

function endSession(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; ${cookieAttributes(0)}`);
}

// Middleware to optionally verify the session without rejecting guests
export function optionalAuthenticate(req, res, next) {
  const token = readCookie(req, SESSION_COOKIE);

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, JWT_VERIFY_OPTIONS, (err, decoded) => {
    req.user = null;
    if (!err) attachLiveUser(req, decoded);
    next();
  });
}

// Middleware to strictly verify the session
export function authenticateToken(req, res, next) {
  const token = readCookie(req, SESSION_COOKIE);

  if (!token) {
    return res.status(401).json({ success: false, error: 'Please log in to continue.' });
  }

  jwt.verify(token, JWT_SECRET, JWT_VERIFY_OPTIONS, (err, decoded) => {
    if (err || !attachLiveUser(req, decoded)) {
      endSession(res);
      return res.status(401).json({ success: false, error: 'Your session has expired. Please log in again.' });
    }
    next();
  });
}

// RBAC middleware: restrict an endpoint to specific roles.
// The role claim is verified against the database to honor live role changes.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'You do not have permission to perform this action.' });
    }
    const dbUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
    if (!dbUser || !roles.includes(dbUser.role)) {
      return res.status(403).json({ success: false, error: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

// POST /api/auth/alumni-register - Register new Alumni account
router.post('/auth/alumni-register', registerLimiter, (req, res) => {
  try {
    const { name, email, password, memberType, classYear, profession, location, phone, bio } = req.body || {};

    if (!name || !email || !password || !memberType || !classYear) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, password, alumni type (OB/OG), and graduating class year are required.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, error: `Password must be between 8 and ${MAX_PASSWORD_LEN} characters long.` });
    }

    const profileError = validateAlumniProfile({ name, memberType, classYear, profession, location, phone, bio });
    if (profileError) {
      return res.status(400).json({ success: false, error: profileError });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanType = memberType.toUpperCase() === 'OG' ? 'OG' : 'OB';

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists. Please log in.' });
    }

    const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    // Role is NEVER taken from the request. The account stays unverified and
    // the directory profile is only written once the email is confirmed, so
    // nobody can claim (and overwrite) another graduate's listing.
    const userInfo = db.prepare('INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, 0)')
      .run(name.trim(), cleanEmail, passwordHash, 'alumni');

    startEmailVerification(userInfo.lastInsertRowid, cleanEmail, name.trim(), {
      alumniProfile: {
        name: name.trim(),
        memberType: cleanType,
        classYear: classYear.trim(),
        profession: profession ? profession.trim() : null,
        location: location ? location.trim() : null,
        phone: phone ? phone.trim() : null,
        bio: bio ? bio.trim() : null
      }
    });

    console.log(`🎓 New alumni registration awaiting email verification (user #${userInfo.lastInsertRowid})`);

    res.status(201).json({
      success: true,
      pendingVerification: true,
      message: 'Almost done! We sent a confirmation link to your email. Open it to activate your alumni account.'
    });
  } catch (err) {
    console.error('Alumni register error:', err);
    res.status(500).json({ success: false, error: 'Failed to create alumni account.' });
  }
});

// Accounts that self-register through the public form. Both start as
// 'pending' with no session; staff accounts are approved by an admin, student
// accounts by staff or an admin.
const REGISTERABLE_ROLES = ['student', 'staff'];
const CLASS_LEVELS = ['Nursery 1', 'Nursery 2', 'Nursery 3', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

// Pupils sign in with a username (they often have no email); staff with email.
const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,29}$/;

function normalizeUsername(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function createPendingAccount(req, res, requestedRole) {
  const { name, email, password, classLevel, username } = req.body || {};
  const isStudent = requestedRole === 'student';
  const hasEmail = typeof email === 'string' && email.trim() !== '';

  if (!name || !password || (isStudent ? !username : !hasEmail)) {
    return res.status(400).json({
      success: false,
      error: isStudent ? 'Name, username, and password are required.' : 'Name, email, and password are required.'
    });
  }

  if (!isValidName(name)) {
    return res.status(400).json({ success: false, error: `Name must be at most ${MAX_NAME_LEN} characters.` });
  }

  const cleanUsername = isStudent ? normalizeUsername(username) : null;
  if (isStudent && !USERNAME_RE.test(cleanUsername)) {
    return res.status(400).json({ success: false, error: 'Username must be 3-30 characters: letters, numbers, dots, dashes or underscores.' });
  }

  if (hasEmail && !isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ success: false, error: `Password must be between 8 and ${MAX_PASSWORD_LEN} characters long.` });
  }

  if (isStudent && !CLASS_LEVELS.includes(classLevel)) {
    return res.status(400).json({ success: false, error: 'Please select a valid class.' });
  }

  const cleanEmail = hasEmail ? email.trim().toLowerCase() : null;

  if (cleanEmail && db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
  }
  if (cleanUsername && db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername)) {
    return res.status(400).json({ success: false, error: 'That username is already taken. Please choose another.' });
  }

  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  // SECURITY: the stored role is always 'pending'; the requested role is only
  // applied when an authorized user approves the account. Without an email
  // there is nothing to verify: staff approval is the identity check.
  const info = db.prepare(`
    INSERT INTO users (name, email, username, password_hash, role, requested_role, class_level, email_verified)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(name.trim(), cleanEmail, cleanUsername, passwordHash, requestedRole, isStudent ? classLevel : null, cleanEmail ? 0 : 1);

  if (cleanEmail) {
    startEmailVerification(info.lastInsertRowid, cleanEmail, name.trim());
  }

  console.log(`👤 New ${requestedRole} signup awaiting ${cleanEmail ? 'verification/' : ''}approval (user #${info.lastInsertRowid})`);

  const approver = isStudent ? 'a staff member' : 'an administrator';
  return res.status(201).json({
    success: true,
    pendingApproval: true,
    pendingVerification: Boolean(cleanEmail),
    message: cleanEmail
      ? `Registration received. Confirm your email using the link we sent you; ${approver} will then approve your account.`
      : `Registration received. You can sign in with your username once ${approver} approves your account.`
  });
}

// POST /api/auth/register - Public registration for students and staff
router.post('/auth/register', registerLimiter, (req, res) => {
  try {
    const { accountType } = req.body || {};
    if (!REGISTERABLE_ROLES.includes(accountType)) {
      return res.status(400).json({ success: false, error: 'Account type must be student or staff.' });
    }
    return createPendingAccount(req, res, accountType);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Failed to create account.' });
  }
});

// POST /api/auth/signup - Legacy staff signup (same as register with accountType=staff)
router.post('/auth/signup', registerLimiter, (req, res) => {
  try {
    return createPendingAccount(req, res, 'staff');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Failed to create user account.' });
  }
});

// POST /api/auth/promote - Promote an existing staff/alumni user to admin.
// Only callable by an existing administrator.
router.post('/auth/promote', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { email } = req.body || {};
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, role FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, error: 'No user found with that email.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'User is already an administrator.' });
    }
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', user.id);
    console.log(`🛡️ User #${user.id} promoted to admin (by user #${req.user.id})`);
    res.json({ success: true, message: `${cleanEmail} has been promoted to administrator.` });
  } catch (err) {
    console.error('Promotion error:', err);
    res.status(500).json({ success: false, error: 'Failed to promote user.' });
  }
});

// Account management permissions:
//  - admins manage every school account (pending, student, staff, admin)
//  - staff manage student accounts and pending student registrations only
const ADMIN_MANAGEABLE_ROLES = ['pending', 'student', 'staff', 'admin'];

function isStudentAccount(user) {
  return user.role === 'student' || (user.role === 'pending' && user.requested_role === 'student');
}

function canManage(actor, target) {
  if (!ADMIN_MANAGEABLE_ROLES.includes(target.role)) return false;
  if (actor.role === 'admin') return true;
  return actor.role === 'staff' && isStudentAccount(target);
}

// GET /api/auth/users - List school accounts the caller may manage
router.get('/auth/users', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, username, role, requested_role, class_level, created_at FROM users
      WHERE role IN ('pending', 'student', 'staff', 'admin')
      ORDER BY CASE role WHEN 'pending' THEN 0 ELSE 1 END, id DESC
    `).all().filter(u => canManage(req.user, u) || u.id === req.user.id);
    res.json({ success: true, users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ success: false, error: 'Failed to load accounts.' });
  }
});

// POST /api/auth/users/:id/approve - Grant a pending account its requested role
router.post('/auth/users/:id/approve', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user id.' });
    }
    const target = db.prepare('SELECT id, name, email, role, requested_role, email_verified FROM users WHERE id = ?').get(userId);
    if (!target || target.role !== 'pending' || !canManage(req.user, target)) {
      return res.status(404).json({ success: false, error: 'Pending account not found.' });
    }
    const newRole = REGISTERABLE_ROLES.includes(target.requested_role) ? target.requested_role : 'staff';
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, userId);
    console.log(`✅ User #${target.id} approved as ${newRole} (by user #${req.user.id})`);
    if (target.email && target.email_verified) {
      sendAccountApprovedEmail(target.email, target.name, newRole);
    }
    res.json({ success: true, role: newRole, message: `${target.email} approved as ${newRole}.` });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, error: 'Failed to approve account.' });
  }
});

// POST /api/auth/users/:id/reset-password - Issue a temporary password.
// For pupils without an email (who can't use "Forgot password"): staff reset
// it and hand the temporary password over in person.
router.post('/auth/users/:id/reset-password', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(userId) || userId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Invalid user id.' });
    }
    const target = db.prepare('SELECT id, role, requested_role FROM users WHERE id = ?').get(userId);
    if (!target || !canManage(req.user, target)) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }
    const temporaryPassword = crypto.randomBytes(6).toString('base64url');
    db.prepare('UPDATE users SET password_hash = ?, password_changed_at = ?, session_version = session_version + 1 WHERE id = ?')
      .run(bcrypt.hashSync(temporaryPassword, bcrypt.genSaltSync(10)), Date.now(), userId);
    console.log(`🔑 Temporary password issued for user #${userId} (by user #${req.user.id})`);
    res.json({ success: true, temporaryPassword });
  } catch (err) {
    console.error('Staff password reset error:', err);
    res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// PATCH /api/auth/users/:id/role - Change a school account's role (admin only)
router.patch('/auth/users/:id/role', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    const { role } = req.body || {};
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user id.' });
    }
    if (!ADMIN_MANAGEABLE_ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: `Role must be one of: ${ADMIN_MANAGEABLE_ROLES.join(', ')}` });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot change your own role.' });
    }
    const target = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(userId);
    if (!target || !ADMIN_MANAGEABLE_ROLES.includes(target.role)) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
    console.log(`🛡️ User #${target.id} role ${target.role} -> ${role} (by user #${req.user.id})`);
    res.json({ success: true, message: `${target.email} is now ${role}.` });
  } catch (err) {
    console.error('Role change error:', err);
    res.status(500).json({ success: false, error: 'Failed to update role.' });
  }
});

// DELETE /api/auth/users/:id - Reject a pending registration or remove an account
router.delete('/auth/users/:id', authenticateToken, requireRole('staff', 'admin'), (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user id.' });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account.' });
    }
    const target = db.prepare('SELECT id, role, requested_role FROM users WHERE id = ?').get(userId);
    if (!target || !canManage(req.user, target)) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ success: true, message: 'Account removed.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, error: 'Failed to remove account.' });
  }
});

// Same generic reply whether or not the email exists, so these endpoints
// can't be used to discover registered addresses.
const GENERIC_EMAIL_REPLY = 'If an account exists for that email, we have sent it a message with further instructions.';

// Separate counters per endpoint, so requesting a few reset emails never
// blocks actually setting the new password.
function emailActionLimiter(max) {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max,
    message: { success: false, error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// POST /api/auth/verify-email - Confirm an email address with a token
router.post('/auth/verify-email', (req, res) => {
  try {
    const row = consumeToken((req.body || {}).token, 'verify');
    if (!row) {
      return res.status(400).json({ success: false, error: 'This confirmation link is invalid or has expired. Request a new one from the sign-in form.' });
    }
    const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(row.user_id);
    if (!user) {
      return res.status(400).json({ success: false, error: 'This account no longer exists.' });
    }
    db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(user.id);

    // Alumni: publish the directory profile now that the email is proven.
    const profile = row.payload ? JSON.parse(row.payload).alumniProfile : null;
    if (profile) {
      const existing = db.prepare('SELECT id FROM alumni_members WHERE email = ?').get(user.email);
      const values = [profile.name, profile.phone, profile.memberType, profile.classYear, profile.profession, profile.location, profile.bio];
      if (existing) {
        db.prepare('UPDATE alumni_members SET name = ?, phone = ?, member_type = ?, class_year = ?, profession = ?, location = ?, bio = ? WHERE id = ?')
          .run(...values, existing.id);
      } else {
        db.prepare('INSERT INTO alumni_members (name, phone, member_type, class_year, profession, location, bio, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(...values, user.email);
      }
    }

    const message = user.role === 'pending'
      ? 'Email confirmed! Your account will be usable once it has been approved by the school.'
      : 'Email confirmed! You can now sign in.';
    res.json({ success: true, message });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, error: 'Failed to confirm email.' });
  }
});

// POST /api/auth/resend-verification - Send a new confirmation link
router.post('/auth/resend-verification', emailActionLimiter(5), (req, res) => {
  try {
    const { email } = req.body || {};
    if (isValidEmail(email)) {
      const user = db.prepare('SELECT id, name, email, email_verified FROM users WHERE email = ?').get(email.trim().toLowerCase());
      if (user && !user.email_verified) {
        // Keep any alumni profile payload from the original registration.
        const previous = db.prepare("SELECT payload FROM auth_tokens WHERE user_id = ? AND purpose = 'verify'").get(user.id);
        startEmailVerification(user.id, user.email, user.name, previous && previous.payload ? JSON.parse(previous.payload) : null);
      }
    }
    res.json({ success: true, message: GENERIC_EMAIL_REPLY });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ success: false, error: 'Failed to send confirmation email.' });
  }
});

// POST /api/auth/forgot-password - Email a password reset link
router.post('/auth/forgot-password', emailActionLimiter(5), (req, res) => {
  try {
    const { email } = req.body || {};
    if (isValidEmail(email)) {
      const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email.trim().toLowerCase());
      if (user) {
        const token = issueToken(user.id, 'reset', RESET_TOKEN_TTL_MS);
        sendPasswordResetEmail(user.email, user.name, token);
      }
    }
    res.json({ success: true, message: GENERIC_EMAIL_REPLY });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, error: 'Failed to start password reset.' });
  }
});

// POST /api/auth/reset-password - Set a new password using a reset token
router.post('/auth/reset-password', emailActionLimiter(10), (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, error: `Password must be between 8 and ${MAX_PASSWORD_LEN} characters long.` });
    }
    const row = consumeToken(token, 'reset');
    if (!row) {
      return res.status(400).json({ success: false, error: 'This reset link is invalid or has expired. Please request a new one.' });
    }
    // Receiving the reset email also proves ownership of the address.
    // Bumping session_version revokes every existing session.
    db.prepare('UPDATE users SET password_hash = ?, email_verified = 1, password_changed_at = ?, session_version = session_version + 1 WHERE id = ?')
      .run(bcrypt.hashSync(password, bcrypt.genSaltSync(10)), Date.now(), row.user_id);
    res.json({ success: true, message: 'Your password has been changed. You can now sign in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// POST /api/auth/login - Authenticate staff/admin/alumni
router.post('/auth/login', loginLimiter, (req, res) => {
  try {
    // `identifier` is an email or a username; `email` kept for older clients
    const { identifier = (req.body || {}).email, password } = req.body || {};

    if (!identifier || !password || typeof identifier !== 'string' || typeof password !== 'string' || password.length > MAX_PASSWORD_LEN) {
      return res.status(400).json({ success: false, error: 'Please enter your email or username and your password.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = cleanIdentifier.includes('@')
      ? db.prepare('SELECT * FROM users WHERE email = ?').get(cleanIdentifier)
      : db.prepare('SELECT * FROM users WHERE username = ?').get(cleanIdentifier);

    // Uniform error + constant-ish work factor: run a dummy compare even when
    // the user doesn't exist so response timing doesn't reveal valid emails.
    const passwordHash = user ? user.password_hash : DUMMY_PASSWORD_HASH;
    const validPassword = bcrypt.compareSync(password, passwordHash);

    if (!user || !validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email/username or password.' });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        error: 'Please confirm your email address first. Check your inbox for the confirmation link.'
      });
    }

    if (user.role === 'pending') {
      const approver = user.requested_role === 'student' ? 'school staff' : 'an administrator';
      return res.status(403).json({ success: false, error: `Your account is awaiting approval by ${approver}.` });
    }

    let extraData = {};
    if (user.role === 'student') {
      extraData = { classLevel: user.class_level || '' };
    } else if (user.role === 'alumni') {
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

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      ...extraData
    };

    startSession(res, userObj, user.session_version);

    console.log(`🔐 User #${user.id} logged in [${user.role}]`);

    res.json({
      success: true,
      message: 'Login successful!',
      user: userObj
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server authentication error.' });
  }
});

// POST /api/auth/logout - End the session (clears the httpOnly cookie)
router.post('/auth/logout', (req, res) => {
  endSession(res);
  res.json({ success: true });
});

// GET /api/auth/me - Fetch current authenticated user
router.get('/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, username, role, class_level, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    let extraData = {};
    if (user.role === 'student') {
      extraData = { classLevel: user.class_level || '' };
    } else if (user.role === 'alumni') {
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

    const { class_level, ...profile } = user;
    res.json({
      success: true,
      user: { ...profile, ...extraData }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
