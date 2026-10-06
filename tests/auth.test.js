import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, createClient, signIn, waitFor, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.stop(); });

test('login sets an httpOnly, SameSite=Strict session cookie and returns no token', async () => {
  const client = createClient(server.url);
  const res = await client('POST', '/api/auth/login', { identifier: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.role, 'admin');
  assert.ok(!('token' in res.body));
  const cookie = res.headers.get('set-cookie');
  assert.match(cookie, /rpps_session=/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.equal((await client('GET', '/api/auth/me')).body.user.email, ADMIN_EMAIL);
});

test('wrong password and unknown users get the same generic error', async () => {
  const client = createClient(server.url);
  const wrong = await client('POST', '/api/auth/login', { identifier: ADMIN_EMAIL, password: 'nope-nope' });
  const unknown = await client('POST', '/api/auth/login', { identifier: 'ghost@x.com', password: 'nope-nope' });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(wrong.body.error, unknown.body.error);
});

test('state-changing requests without the CSRF header are rejected', async () => {
  const admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
  const blocked = await admin('POST', '/api/news', { title: 't', category: 'c', day: 1, month: 'jan', summary: 's' }, { csrf: false });
  assert.equal(blocked.status, 403);
  const allowed = await admin('POST', '/api/news', { title: 't', category: 'c', day: 1, month: 'jan', summary: 's' });
  assert.equal(allowed.status, 201);
});

test('a bearer token is not accepted; only the cookie session', async () => {
  const res = await fetch(`${server.url}/api/applications`, { headers: { Authorization: 'Bearer anything' } });
  assert.equal(res.status, 401);
});

test('logout clears the cookie and ends the session', async () => {
  const admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
  const res = await admin('POST', '/api/auth/logout');
  assert.match(res.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await admin('GET', '/api/applications')).status, 401);
});

test('new accounts must verify their email before signing in', async () => {
  const anon = createClient(server.url);
  const reg = await anon('POST', '/api/auth/register', { accountType: 'staff', name: 'Teacher', email: 'teacher@x.com', password: 'password123' });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.pendingVerification, true);

  const blocked = await anon('POST', '/api/auth/login', { identifier: 'teacher@x.com', password: 'password123' });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.body.code, 'EMAIL_NOT_VERIFIED');

  await waitFor(() => server.output().includes('teacher@x.com'));
  const token = server.mailLink('verify');
  assert.equal((await anon('POST', '/api/auth/verify-email', { token })).body.success, true);
  assert.equal((await anon('POST', '/api/auth/verify-email', { token })).status, 400, 'token is single-use');

  const pending = await anon('POST', '/api/auth/login', { identifier: 'teacher@x.com', password: 'password123' });
  assert.equal(pending.status, 403);
  assert.match(pending.body.error, /approval/);
});

test('forgot/resend endpoints do not reveal whether an email exists', async () => {
  const anon = createClient(server.url);
  const a = await anon('POST', '/api/auth/forgot-password', { email: 'ghost@x.com' });
  const b = await anon('POST', '/api/auth/forgot-password', { email: ADMIN_EMAIL });
  assert.deepEqual(a.body, b.body);
  const c = await anon('POST', '/api/auth/resend-verification', { email: 'ghost@x.com' });
  assert.equal(c.body.success, true);
});

test('password reset works once and revokes existing sessions', async () => {
  const session = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
  const anon = createClient(server.url);
  await anon('POST', '/api/auth/forgot-password', { email: ADMIN_EMAIL });
  await waitFor(() => server.mailLink('reset'));
  const token = server.mailLink('reset');

  assert.equal((await anon('POST', '/api/auth/reset-password', { token, password: 'short' })).status, 400);
  assert.equal((await anon('POST', '/api/auth/reset-password', { token, password: 'BrandNewPass456' })).body.success, true);
  assert.equal((await anon('POST', '/api/auth/reset-password', { token, password: 'Another12345' })).status, 400, 'single-use');

  assert.equal((await session('GET', '/api/auth/me')).status, 401, 'old session revoked');
  assert.equal((await anon('POST', '/api/auth/login', { identifier: ADMIN_EMAIL, password: ADMIN_PASSWORD })).status, 401);
  const fresh = await signIn(server.url, ADMIN_EMAIL, 'BrandNewPass456');
  assert.equal((await fresh('GET', '/api/auth/me')).status, 200);

  // restore for other tests
  await anon('POST', '/api/auth/forgot-password', { email: ADMIN_EMAIL });
  await waitFor(() => server.mailLink('reset') !== token);
  await anon('POST', '/api/auth/reset-password', { token: server.mailLink('reset'), password: ADMIN_PASSWORD });
});

test('only failed logins count toward the rate limit', async () => {
  for (let i = 0; i < 12; i++) {
    const ok = await createClient(server.url)('POST', '/api/auth/login', { identifier: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    assert.equal(ok.status, 200, `successful login #${i + 1} must not be throttled`);
  }
});
