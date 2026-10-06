import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, createClient, signIn, createApprovedUser, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

let server;
let admin;
const event = {
  term: 'term-1',
  category: 'academic',
  title: { en: 'Science Quiz', fr: 'Quiz de Sciences' },
  description: { en: 'Inter-class quiz' },
  startDate: '2026-12-28T09:00',
  endDate: '2027-01-02T12:00',
  audience: 'P5 - P6',
  location: 'Science Lab',
};

before(async () => {
  server = await startServer();
  admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
});
after(async () => { await server.stop(); });

test('visitors and alumni cannot read the calendar', async () => {
  assert.equal((await createClient(server.url)('GET', '/api/calendar')).status, 401);
});

test('the calendar is seeded with 3 terms and 15 events', async () => {
  const { terms, events } = (await admin('GET', '/api/calendar')).body;
  assert.equal(terms.length, 3);
  assert.equal(events.length, 15);
  assert.equal(events[0].dateDisplay, 'Sep 07, 2026');
  assert.ok(events.every((e, i) => i === 0 || events[i - 1].startDate <= e.startDate), 'sorted by date');
});

test('staff can create, update and delete events', async () => {
  const created = await admin('POST', '/api/calendar/events', event);
  assert.equal(created.status, 201);
  assert.equal(created.body.event.dateDisplay, 'Dec 28, 2026 – Jan 02, 2027');
  assert.equal(created.body.event.title.fr, 'Quiz de Sciences');

  const id = created.body.event.id;
  const updated = await admin('PUT', `/api/calendar/events/${id}`, { ...event, title: { en: 'Final Quiz' }, startDate: '2026-11-03T09:00', endDate: '2026-11-03T12:00' });
  assert.equal(updated.body.event.title.en, 'Final Quiz');
  assert.equal(updated.body.event.dateDisplay, 'Nov 03, 2026');

  assert.equal((await admin('DELETE', `/api/calendar/events/${id}`)).body.success, true);
  assert.equal((await admin('DELETE', `/api/calendar/events/${id}`)).status, 404);
});

test('invalid events are rejected', async () => {
  const bad = [
    { startDate: '2026-02-30T09:00' },
    { endDate: '2026-12-01T09:00' },
    { category: 'party' },
    { title: { fr: 'missing english' } },
    { term: 'term-9' },
  ];
  for (const change of bad) {
    const res = await admin('POST', '/api/calendar/events', { ...event, ...change });
    assert.equal(res.status, 400, JSON.stringify(change));
  }
});

test('activating a term completes the earlier active term', async () => {
  await admin('PATCH', '/api/calendar/terms/term-2', { status: 'active', highlights: { en: 'Updated highlights' } });
  const terms = (await admin('GET', '/api/calendar')).body.terms;
  assert.deepEqual(terms.map(t => t.status), ['completed', 'active', 'upcoming']);
  assert.equal(terms[1].highlights.en, 'Updated highlights');
  assert.ok(terms[1].highlights.rw, 'existing translations are kept');
  assert.equal((await admin('PATCH', '/api/calendar/terms/term-1', { status: 'finished' })).status, 400);
});

test('pupils can read but not edit the calendar', async () => {
  await createApprovedUser(server, admin, { accountType: 'student', name: 'Kid', username: 'kid', password: 'password123' });
  const kid = await signIn(server.url, 'kid', 'password123');
  assert.equal((await kid('GET', '/api/calendar')).status, 200);
  assert.equal((await kid('POST', '/api/calendar/events', event)).status, 403);
  assert.equal((await kid('PATCH', '/api/calendar/terms/term-1', { status: 'active' })).status, 403);
});
