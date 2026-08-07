// Database initialization — ensures all tables exist.
// Called as a side-effect on first import (via auth.ts).
import Database from 'better-sqlite3';

let initialized = false;

export function ensureTables(): void {
  if (initialized) return;
  initialized = true;

  const sqlite = new Database('data/admin.db');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      link TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      target_category TEXT,
      slot TEXT NOT NULL CHECK(slot IN ('sidebar-left','sidebar-right','profile')),
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      zone TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      services TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      admin_notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  sqlite.close();
}
