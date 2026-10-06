import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, createClient, signIn, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.stop(); });

test('security headers are set on every response', async () => {
  const res = await fetch(`${server.url}/api/health`);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('x-powered-by'), null);
  const csp = res.headers.get('content-security-policy');
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self'(;|$)/);
  assert.match(csp, /frame-ancestors 'none'/);
});

test('malformed JSON gets a JSON error, not a stack trace', async () => {
  const res = await fetch(`${server.url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'rpps' },
    body: '{not json',
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.ok(!JSON.stringify(body).includes('at '), 'no stack trace');
});

test('unknown API routes return JSON 404', async () => {
  const res = await createClient(server.url)('GET', '/api/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

test('forged and tampered session cookies are rejected', async () => {
  const forged = 'eyJhbGciOiJub25lIn0.eyJpZCI6MSwicm9sZSI6ImFkbWluIn0.';
  const res = await fetch(`${server.url}/api/auth/users`, { headers: { Cookie: `rpps_session=${forged}` } });
  assert.equal(res.status, 401);
});

test('news can only be published by staff, and type is validated', async () => {
  const admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
  const item = { title: 'T', category: 'C', day: '01', month: 'JAN', summary: 'S' };
  assert.equal((await createClient(server.url)('POST', '/api/news', item)).status, 401);
  assert.equal((await admin('POST', '/api/news', { ...item, type: '<script>' })).status, 400);
  const created = await admin('POST', '/api/news', { ...item, body: 'Full story' });
  assert.equal(created.status, 201);
  const news = (await createClient(server.url)('GET', '/api/news')).body.newsAndEvents;
  assert.equal(news.find(n => n.id === created.body.id).body, 'Full story');
});

test('server logs never contain passwords or chat content', async () => {
  const admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
  await admin('POST', '/api/alumni/messages', { channel: 'general', content: 'secret-chat-text' });
  const log = server.output();
  assert.ok(!log.includes(ADMIN_PASSWORD));
  assert.ok(!log.includes('secret-chat-text'));
});
