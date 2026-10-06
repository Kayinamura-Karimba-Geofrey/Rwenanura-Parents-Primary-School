import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, createClient, signIn, waitFor, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

let server;
let admin;
before(async () => {
  server = await startServer({ ADMISSIONS_NOTIFY_EMAIL: 'office@school.test' });
  admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
});
after(async () => { await server.stop(); });

const application = { parentName: 'Jane', phone: '0788000000', email: 'jane@x.com', childName: 'Kim', grade: 'P1' };

test('families can apply and track with an unguessable code', async () => {
  const anon = createClient(server.url);
  const res = await anon('POST', '/api/applications', application);
  assert.equal(res.status, 201);
  assert.match(res.body.trackingCode, /^RPPS-\d{4}-[0-9a-f]{16}$/);
  const tracked = await anon('GET', `/api/applications/track/${res.body.trackingCode}`);
  assert.equal(tracked.body.application.child_name, 'Kim');
  assert.ok(!('phone' in tracked.body.application), 'tracking never exposes contact details');
});

test('submitting emails the parent and alerts the office', async () => {
  await waitFor(() => server.mails().some(m => m.to === 'office@school.test'));
  const mails = server.mails();
  assert.ok(mails.some(m => m.to === 'jane@x.com' && /Application received/.test(m.subject)));
});

test('the application list is staff-only', async () => {
  assert.equal((await createClient(server.url)('GET', '/api/applications')).status, 401);
  assert.equal((await admin('GET', '/api/applications')).body.total, 1);
});

test('status changes are validated and emailed to the parent once', async () => {
  const app = (await admin('GET', '/api/applications')).body.applications[0];
  assert.equal((await admin('PATCH', `/api/applications/${app.id}`, { status: 'Hacked' })).status, 400);

  const before = server.mails().length;
  await admin('PATCH', `/api/applications/${app.id}`, { status: 'Approved' });
  await waitFor(() => server.mails().length > before);
  assert.ok(server.mails().slice(before).some(m => m.to === 'jane@x.com' && /Approved/.test(m.subject)));

  const count = server.mails().length;
  await admin('PATCH', `/api/applications/${app.id}`, { status: 'Approved' });
  await new Promise(r => setTimeout(r, 200));
  assert.equal(server.mails().length, count, 'no email when the status did not change');
});

test('oversized and malformed applications are rejected', async () => {
  const anon = createClient(server.url);
  assert.equal((await anon('POST', '/api/applications', { ...application, notes: 'x'.repeat(5000) })).status, 400);
  assert.equal((await anon('POST', '/api/applications', { ...application, childName: { $ne: 1 } })).status, 400);
  assert.equal((await anon('POST', '/api/applications', { parentName: 'only' })).status, 400);
});

test('newsletter sign-up validates the address and hides the list', async () => {
  const anon = createClient(server.url);
  assert.equal((await anon('POST', '/api/newsletter', { email: 'not-an-email' })).status, 400);
  assert.equal((await anon('POST', '/api/newsletter', { email: 'parent@x.com' })).body.success, true);
  assert.equal((await anon('GET', '/api/newsletter')).status, 401);
  assert.equal((await admin('GET', '/api/newsletter')).body.count, 1);
});
