import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, createClient, signIn, waitFor, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

let server;
let admin;
before(async () => {
  server = await startServer();
  admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
});
after(async () => { await server.stop(); });

test('directory hides contact details from visitors', async () => {
  const res = (await createClient(server.url)('GET', '/api/alumni/members?search=Grace')).body;
  assert.equal(res.members.length, 1);
  assert.equal(res.members[0].phone, null);
  assert.equal(res.members[0].email, null);
  assert.equal((await admin('GET', '/api/alumni/members')).body.isAuthorized, true);
});

test('directory search treats % and _ literally', async () => {
  const res = (await createClient(server.url)('GET', `/api/alumni/members?search=${encodeURIComponent('%')}`)).body;
  assert.equal(res.members.length, 0);
});

test('only staff can add directory entries directly', async () => {
  const entry = { name: 'Listed Grad', memberType: 'OB', classYear: 'Class of 2001', email: 'grad@x.com' };
  assert.equal((await createClient(server.url)('POST', '/api/alumni/members', entry)).status, 401);
  assert.equal((await admin('POST', '/api/alumni/members', entry)).status, 201);
  assert.equal((await admin('POST', '/api/alumni/members', entry)).status, 400, 'duplicate email');
});

test('an alumni sign-up cannot overwrite a profile before the email is verified', async () => {
  const anon = createClient(server.url);
  const before = (await anon('GET', '/api/alumni/members?search=Grace')).body.members[0];
  const reg = await anon('POST', '/api/auth/alumni-register', {
    name: 'Impostor', email: 'grace.uwase@gmail.com', password: 'password123', memberType: 'OG', classYear: '2018', bio: 'changed'
  });
  assert.equal(reg.body.pendingVerification, true);
  assert.ok(!reg.body.token);
  const after = (await anon('GET', '/api/alumni/members?search=Grace')).body.members[0];
  assert.equal(after.bio, before.bio);

  await waitFor(() => server.output().includes('grace.uwase@gmail.com'));
  await anon('POST', '/api/auth/verify-email', { token: server.mailLink('verify') });
  const alumni = await signIn(server.url, 'grace.uwase@gmail.com', 'password123');
  assert.equal((await alumni('GET', '/api/auth/me')).body.user.role, 'alumni');
});

test('posting requires sign-in and uses the signed-in identity', async () => {
  assert.equal((await createClient(server.url)('POST', '/api/alumni/messages', { content: 'hi' })).status, 401);
  const alumni = await signIn(server.url, 'grace.uwase@gmail.com', 'password123');
  const res = await alumni('POST', '/api/alumni/messages', { channel: 'general', content: 'Hello!', authorName: 'Someone Else' });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.author_name, 'Impostor');
});

test('each user can like a message once; liking again removes the like', async () => {
  const messages = (await admin('GET', '/api/alumni/messages?channel=general')).body.messages;
  const msg = messages[0];
  assert.equal(msg.liked_by_me, false);
  const first = await admin('POST', `/api/alumni/messages/${msg.id}/react`);
  assert.deepEqual([first.body.liked, first.body.likesCount], [true, msg.likes_count + 1]);
  const second = await admin('POST', `/api/alumni/messages/${msg.id}/react`);
  assert.deepEqual([second.body.liked, second.body.likesCount], [false, msg.likes_count]);
  assert.equal((await admin('POST', '/api/alumni/messages/999999/react')).status, 404);
});

test('typing indicator only accepts known channels', async () => {
  assert.equal((await admin('POST', '/api/alumni/typing', { channel: '<img src=x>' })).status, 400);
  assert.equal((await admin('POST', '/api/alumni/typing', { channel: 'general' })).status, 200);
});
