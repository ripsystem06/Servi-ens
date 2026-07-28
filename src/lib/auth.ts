import { db } from './db';
import { adminUsers } from './schema';
import bcrypt from 'bcryptjs';

// ─── In-memory session store ────────────────────────────────────────
interface SessionData {
  email: string;
  createdAt: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_MAX_AGE = 86400 * 1000; // 24h in ms

function cleanupSessions(): void {
  const now = Date.now();
  for (const [id, data] of sessions) {
    if (now - data.createdAt > SESSION_MAX_AGE) {
      sessions.delete(id);
    }
  }
}

// ─── Public API ─────────────────────────────────────────────────────

export function createSession(email: string): string {
  cleanupSessions();
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { email, createdAt: Date.now() });
  return sessionId;
}

export function validateSession(sessionId: string): SessionData | null {
  cleanupSessions();
  const data = sessions.get(sessionId);
  if (!data) return null;
  if (Date.now() - data.createdAt > SESSION_MAX_AGE) {
    sessions.delete(sessionId);
    return null;
  }
  return data;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Admin seeding ──────────────────────────────────────────────────

export async function seedAdminUser(): Promise<void> {
  // Ensure the admin_users table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const existing = db.select().from(adminUsers).limit(1).all();
  if (existing.length > 0) return;

  const email = process.env.ADMIN_EMAIL || 'admin@catalogoensenada.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await hashPassword(password);

  db.insert(adminUsers).values({
    email,
    passwordHash,
  }).run();

  console.log(`[auth] Seeded admin user: ${email}`);
}

// Auto-seed on first import (module-level side effect)
seedAdminUser().catch((err) => {
  console.error('[auth] Failed to seed admin user:', err);
});
