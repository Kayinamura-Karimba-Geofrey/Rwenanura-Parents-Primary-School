// Test helpers: start the real API server on a throwaway database and talk to
// it like a browser would (cookie session + CSRF header).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const ADMIN_EMAIL = 'admin@rwenanura.ac.rw';
export const ADMIN_PASSWORD = 'TestAdminPass123';

/**
 * Start server/index.js with a fresh SQLite database in a temp directory.
 * Returns { url, output(), mailLink(kind), stop() }.
 */
export async function startServer(extraEnv = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rpps-test-'));
  const port = 20000 + Math.floor(Math.random() * 20000);
  let output = '';

  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      DB_PATH: path.join(dir, 'test.sqlite'),
      JWT_SECRET: 'test-only-jwt-secret-0123456789abcdef0123456789',
      SEED_ADMIN_EMAIL: ADMIN_EMAIL,
      SEED_ADMIN_PASSWORD: ADMIN_PASSWORD,
      APP_URL: `http://localhost:${port}`,
      SMTP_HOST: '',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start:\n${output}`)), 15000);
    const check = setInterval(() => {
      if (output.includes('running on')) { clearInterval(check); clearTimeout(timer); resolve(); }
    }, 50);
    child.on('exit', (code) => { clearInterval(check); clearTimeout(timer); reject(new Error(`Server exited (${code}):\n${output}`)); });
  });

  return {
    url: `http://localhost:${port}`,
    output: () => output,
    // Latest link of a kind ('verify' | 'reset' | 'track') printed by the
    // development mailer (SMTP is disabled in tests).
    mailLink(kind) {
      const matches = [...output.matchAll(new RegExp(`\\?${kind}=([A-Za-z0-9_-]+)`, 'g'))];
      return matches.length ? matches[matches.length - 1][1] : null;
    },
    // Subjects and recipients of every email "sent" so far
    mails() {
      return [...output.matchAll(/\[mail not configured\] To: (\S+)\n\s+Subject: ([^\n]+)/g)]
        .map(m => ({ to: m[1], subject: m[2] }));
    },
    async stop() {
      child.removeAllListeners('exit');
      child.kill();
      await new Promise(r => child.once('close', r));
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

/**
 * A cookie-jar client. Every call returns { status, body, headers }.
 * Pass { csrf: false } to omit the X-Requested-With header.
 */
export function createClient(baseUrl) {
  let cookie = '';
  return async function request(method, urlPath, body, { csrf = true } = {}) {
    const res = await fetch(baseUrl + urlPath, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'X-Requested-With': 'rpps' } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const pair = setCookie.split(';')[0];
      cookie = pair.endsWith('=') ? '' : pair;
    }
    const text = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    return { status: res.status, body: parsed, headers: res.headers };
  };
}

export async function signIn(baseUrl, identifier, password) {
  const client = createClient(baseUrl);
  const res = await client('POST', '/api/auth/login', { identifier, password });
  if (res.status !== 200) throw new Error(`Login failed for ${identifier}: ${JSON.stringify(res.body)}`);
  return client;
}

// Register + verify (if email) + approve a pupil or staff account.
export async function createApprovedUser(server, admin, { accountType, name, email, username, password, classLevel = 'P1' }) {
  const anon = createClient(server.url);
  const reg = await anon('POST', '/api/auth/register', { accountType, name, email, username, password, classLevel });
  if (reg.status !== 201) throw new Error(`Register failed: ${JSON.stringify(reg.body)}`);
  if (email) {
    await waitFor(() => server.output().includes(email));
    await anon('POST', '/api/auth/verify-email', { token: server.mailLink('verify') });
  }
  const users = (await admin('GET', '/api/auth/users')).body.users;
  const user = users.find(u => (email ? u.email === email : u.username === username));
  await admin('POST', `/api/auth/users/${user.id}/approve`);
  return user;
}

export async function waitFor(condition, timeoutMs = 3000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error('waitFor timed out');
    await new Promise(r => setTimeout(r, 20));
  }
}
