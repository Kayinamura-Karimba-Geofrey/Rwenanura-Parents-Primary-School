#!/usr/bin/env node
// Back up the SQLite database.
//
//   npm run backup
//
// Uses SQLite's online backup API, so it is safe while the server is running.
// Each backup is verified (integrity check), gzip-compressed, and only the
// newest BACKUP_KEEP files are kept.
//
// Environment (read from .env too):
//   DB_PATH      database file   (default server/data/database.sqlite)
//   BACKUP_DIR   backup folder   (default server/data/backups)
//   BACKUP_KEEP  backups to keep (default 14)
import '../server/env.js';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = path.resolve(ROOT, process.env.DB_PATH || 'server/data/database.sqlite');
const backupDir = path.resolve(ROOT, process.env.BACKUP_DIR || 'server/data/backups');
const keep = Math.max(1, Number.parseInt(process.env.BACKUP_KEEP || '14', 10) || 14);

if (!fs.existsSync(dbPath)) {
  console.error(`No database found at ${dbPath}`);
  process.exit(1);
}
fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const tmpFile = path.join(backupDir, `.database-${stamp}.sqlite`);
const finalFile = path.join(backupDir, `database-${stamp}.sqlite.gz`);

// The copy inherits WAL mode; opening it creates -wal/-shm side files
function removeTemp() {
  for (const suffix of ['', '-wal', '-shm', '-journal']) fs.rmSync(tmpFile + suffix, { force: true });
}

try {
  const source = new Database(dbPath, { readonly: true, fileMustExist: true });
  await source.backup(tmpFile);
  source.close();

  const copy = new Database(tmpFile, { readonly: true });
  const integrity = copy.pragma('integrity_check', { simple: true });
  const users = copy.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  copy.close();
  if (integrity !== 'ok') throw new Error(`Integrity check failed: ${integrity}`);

  fs.writeFileSync(finalFile, zlib.gzipSync(fs.readFileSync(tmpFile)), { mode: 0o600 });
  removeTemp();

  // Retention: keep the newest backups only
  const backups = fs.readdirSync(backupDir).filter(f => /^database-.*\.sqlite\.gz$/.test(f)).sort();
  const removed = backups.slice(0, Math.max(0, backups.length - keep));
  removed.forEach(f => fs.rmSync(path.join(backupDir, f)));

  const sizeKb = Math.round(fs.statSync(finalFile).size / 1024);
  console.log(`Backup OK: ${finalFile} (${sizeKb} KB, ${users} user accounts)${removed.length ? `; removed ${removed.length} old backup(s)` : ''}`);
} catch (err) {
  removeTemp();
  console.error('Backup FAILED:', err.message);
  process.exit(1);
}
