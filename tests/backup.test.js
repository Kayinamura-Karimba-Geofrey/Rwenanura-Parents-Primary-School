import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { startServer, signIn, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

const run = promisify(execFile);
let server;
let work;
let dbPath;

before(async () => {
  work = fs.mkdtempSync(path.join(os.tmpdir(), 'rpps-backup-'));
  dbPath = path.join(work, 'live.sqlite');
  server = await startServer({ DB_PATH: dbPath });
  const admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
  await admin('POST', '/api/news', { title: 'Backed up article', category: 'Test', day: '01', month: 'JAN', summary: 'S' });
});
after(async () => {
  await server.stop();
  fs.rmSync(work, { recursive: true, force: true });
});

const env = (extra = {}) => ({ ...process.env, DB_PATH: dbPath, BACKUP_DIR: path.join(work, 'backups'), JWT_SECRET: 'x'.repeat(40), ...extra });

test('backups are taken while the server runs, verified, compressed and rotated', async () => {
  for (let i = 0; i < 3; i++) {
    const { stdout } = await run(process.execPath, ['scripts/backup-db.js'], { env: env({ BACKUP_KEEP: '2' }) });
    assert.match(stdout, /Backup OK/);
    await new Promise(r => setTimeout(r, 1100)); // distinct timestamps
  }
  const files = fs.readdirSync(path.join(work, 'backups'));
  assert.equal(files.length, 2, 'only the newest BACKUP_KEEP backups are kept');
  assert.ok(files.every(f => f.endsWith('.sqlite.gz')));
});

test('restore requires --yes, keeps the old database and brings the data back', async () => {
  const backup = path.join(work, 'backups', fs.readdirSync(path.join(work, 'backups')).sort().pop());
  const target = path.join(work, 'restored.sqlite');
  fs.writeFileSync(target, 'not a database');

  await assert.rejects(run(process.execPath, ['scripts/restore-db.js', backup], { env: env({ DB_PATH: target }) }));

  const { stdout } = await run(process.execPath, ['scripts/restore-db.js', backup, '--yes'], { env: env({ DB_PATH: target }) });
  assert.match(stdout, /Restored/);
  assert.ok(fs.readdirSync(work).some(f => f.startsWith('restored.sqlite.before-restore-')), 'previous file kept');

  const db = new Database(target, { readonly: true });
  const titles = db.prepare('SELECT title FROM news_events').all().map(r => r.title);
  db.close();
  assert.ok(titles.includes('Backed up article'));
});

test('a corrupt backup is rejected without touching the database', async () => {
  const bad = path.join(work, 'bad.sqlite');
  fs.writeFileSync(bad, 'garbage');
  const target = path.join(work, 'keep.sqlite');
  fs.writeFileSync(target, 'original');
  await assert.rejects(run(process.execPath, ['scripts/restore-db.js', bad, '--yes'], { env: env({ DB_PATH: target }) }));
  assert.equal(fs.readFileSync(target, 'utf8'), 'original');
});
