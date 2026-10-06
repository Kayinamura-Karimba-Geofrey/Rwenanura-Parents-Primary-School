import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, createClient, signIn, createApprovedUser, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

let server;
let admin;
before(async () => {
  server = await startServer();
  admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
});
after(async () => { await server.stop(); });

test('public registration can never create an admin', async () => {
  const anon = createClient(server.url);
  assert.equal((await anon('POST', '/api/auth/register', { accountType: 'admin', name: 'X', email: 'x@x.com', password: 'password123' })).status, 400);
  const legacy = await anon('POST', '/api/auth/signup', { name: 'Y', email: 'y@x.com', password: 'password123', role: 'admin' });
  assert.equal(legacy.status, 201);
  const user = (await admin('GET', '/api/auth/users')).body.users.find(u => u.email === 'y@x.com');
  assert.equal(user.role, 'pending');
  assert.equal(user.requested_role, 'staff');
});

test('pupils register with a username; email is optional', async () => {
  const anon = createClient(server.url);
  const reg = await anon('POST', '/api/auth/register', { accountType: 'student', name: 'Pupil', username: 'Pupil.One', password: 'password123', classLevel: 'P2' });
  assert.equal(reg.status, 201);
  assert.equal(reg.body.pendingVerification, false);
  assert.equal((await anon('POST', '/api/auth/register', { accountType: 'student', name: 'Dup', username: 'pupil.one', password: 'password123', classLevel: 'P2' })).status, 400, 'username is unique (case-insensitive)');
  assert.equal((await anon('POST', '/api/auth/register', { accountType: 'student', name: 'Bad', username: 'has space', password: 'password123', classLevel: 'P2' })).status, 400);
  assert.equal((await anon('POST', '/api/auth/register', { accountType: 'student', name: 'NoClass', username: 'noclass', password: 'password123', classLevel: 'P9' })).status, 400);
  assert.equal((await anon('POST', '/api/auth/register', { accountType: 'staff', name: 'NoEmail', username: 'teacher', password: 'password123' })).status, 400, 'staff need an email');
});

test('staff approve pupils; pupils sign in with their username', async () => {
  const teacher = await createApprovedUser(server, admin, { accountType: 'staff', name: 'Teacher', email: 'teacher@x.com', password: 'password123' });
  assert.equal(teacher.requested_role, 'staff');
  const staff = await signIn(server.url, 'teacher@x.com', 'password123');

  const pupil = (await staff('GET', '/api/auth/users')).body.users.find(u => u.username === 'pupil.one');
  assert.ok(pupil, 'staff see pending pupils');
  assert.equal((await staff('POST', `/api/auth/users/${pupil.id}/approve`)).body.role, 'student');

  const kid = await signIn(server.url, 'PUPIL.ONE', 'password123');
  const me = (await kid('GET', '/api/auth/me')).body.user;
  assert.equal(me.role, 'student');
  assert.equal(me.classLevel, 'P2');
});

test('staff only see and manage pupil accounts', async () => {
  const staff = await signIn(server.url, 'teacher@x.com', 'password123');
  const users = (await staff('GET', '/api/auth/users')).body.users;
  assert.ok(users.every(u => u.role === 'student' || u.requested_role === 'student' || u.email === 'teacher@x.com'));
  const adminUser = (await admin('GET', '/api/auth/users')).body.users.find(u => u.role === 'admin');
  assert.equal((await staff('DELETE', `/api/auth/users/${adminUser.id}`)).status, 404);
  assert.equal((await staff('PATCH', `/api/auth/users/${adminUser.id}/role`, { role: 'staff' })).status, 403);
  const pendingStaff = (await admin('GET', '/api/auth/users')).body.users.find(u => u.email === 'y@x.com');
  assert.equal((await staff('POST', `/api/auth/users/${pendingStaff.id}/approve`)).status, 404, 'staff cannot approve staff');
});

test('admins cannot change or delete their own account', async () => {
  const me = (await admin('GET', '/api/auth/me')).body.user;
  assert.equal((await admin('PATCH', `/api/auth/users/${me.id}/role`, { role: 'staff' })).status, 400);
  assert.equal((await admin('DELETE', `/api/auth/users/${me.id}`)).status, 400);
});

test('staff can issue a temporary password, which revokes the pupil session', async () => {
  const staff = await signIn(server.url, 'teacher@x.com', 'password123');
  const kid = await signIn(server.url, 'pupil.one', 'password123');
  const pupil = (await staff('GET', '/api/auth/users')).body.users.find(u => u.username === 'pupil.one');
  const res = await staff('POST', `/api/auth/users/${pupil.id}/reset-password`);
  assert.ok(res.body.temporaryPassword.length >= 8);
  assert.equal((await kid('GET', '/api/auth/me')).status, 401);
  await signIn(server.url, 'pupil.one', res.body.temporaryPassword);
});

test('removing an account immediately invalidates its session', async () => {
  const user = await createApprovedUser(server, admin, { accountType: 'student', name: 'Temp', username: 'temp.pupil', password: 'password123' });
  const session = await signIn(server.url, 'temp.pupil', 'password123');
  assert.equal((await admin('DELETE', `/api/auth/users/${user.id}`)).body.success, true);
  assert.equal((await session('GET', '/api/auth/me')).status, 401);
});

test('pupils cannot reach staff data', async () => {
  await createApprovedUser(server, admin, { accountType: 'student', name: 'Temp2', username: 'temp2', password: 'password123' });
  const kid = await signIn(server.url, 'temp2', 'password123');
  assert.equal((await kid('GET', '/api/applications')).status, 403);
  assert.equal((await kid('GET', '/api/newsletter')).status, 403);
  assert.equal((await kid('GET', '/api/auth/users')).status, 403);
  assert.equal((await kid('POST', '/api/news', { title: 't', category: 'c', day: 1, month: 'jan', summary: 's' })).status, 403);
});
