import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

function getDatabasePath(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const bundledDbPath = path.join(process.cwd(), 'data', 'fatma.db');

  // When running on Vercel serverless environment:
  if (process.env.VERCEL) {
    const tmpDbPath = path.join('/tmp', 'fatma.db');
    // Copy bundled seed database to /tmp if it doesn't exist yet
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
      try {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
        console.log('Successfully copied seed database to /tmp/fatma.db for Vercel serverless');
      } catch (e) {
        console.error('Failed to copy database to /tmp:', e);
      }
    }
    return fs.existsSync(tmpDbPath) ? tmpDbPath : bundledDbPath;
  }

  // Ensure local data directory exists
  const dataDir = path.dirname(bundledDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return bundledDbPath;
}

const DB_PATH = getDatabasePath();
const isVercel = Boolean(process.env.VERCEL);

const sqlite = new Database(DB_PATH);

if (isVercel) {
  // Use memory journal mode on serverless to avoid filesystem locking issues
  sqlite.pragma('journal_mode = MEMORY');
} else {
  sqlite.pragma('journal_mode = WAL');
}

sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');

export const db = drizzle(sqlite, { schema });
export { schema };
