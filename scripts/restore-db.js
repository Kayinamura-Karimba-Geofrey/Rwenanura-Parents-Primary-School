#!/usr/bin/env node
// Restore the SQLite database from a backup made by scripts/backup-db.js.
//
//   npm run restore -- server/data/backups/database-2026-10-07T02-00-00.sqlite.gz --yes
//
// STOP THE SERVER FIRST. The current database is kept next to it as
// database.sqlite.before-restore-<time> rather than deleted.
import '../server/env.js';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = path.resolve(ROOT, process.env.DB_PATH || 'server/data/database.sqlite');
const [backupArg] = process.argv.slice(2).filter(a => !a.startsWith('--'));

if (!backupArg) {
  console.error('Usage: npm run restore -- <backup file> --yes');
  process.exit(1);
}
const backupFile = path.resolve(backupArg);
if (!fs.existsSync(backupFile)) {
  console.error(`Backup not found: ${backupFile}`);
  process.exit(1);
}
if (!process.argv.includes('--yes')) {
  console.error(`This replaces ${dbPath} with ${backupFile}.\nStop the server first, then re-run with --yes.`);
  process.exit(1);
}

// Decompress to a temporary file and verify it before touching the live database
const tmpFile = `${dbPath}.restoring`;
const data = fs.readFileSync(backupFile);
fs.writeFileSync(tmpFile, backupFile.endsWith('.gz') ? zlib.gunzipSync(data) : data, { mode: 0o600 });
const check = new Database(tmpFile, { readonly: true });
const integrity = check.pragma('integrity_check', { simple: true });
check.close();
for (const suffix of ['-wal', '-shm']) fs.rmSync(tmpFile + suffix, { force: true });
if (integrity !== 'ok') {
  fs.rmSync(tmpFile);
  console.error(`Backup is corrupt (${integrity}); nothing was changed.`);
  process.exit(1);
}

if (fs.existsSync(dbPath)) {
  const aside = `${dbPath}.before-restore-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
  fs.renameSync(dbPath, aside);
  console.log(`Previous database kept at ${aside}`);
}
// Write-ahead log files belong to the old database
for (const suffix of ['-wal', '-shm']) fs.rmSync(dbPath + suffix, { force: true });
fs.renameSync(tmpFile, dbPath);
console.log(`Restored ${dbPath} from ${backupFile}. You can start the server again.`);
