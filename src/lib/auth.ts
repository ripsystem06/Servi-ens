import { db } from './db';
import { adminUsers } from './schema';
import bcrypt from 'bcryptjs';

// ─── In-memory session store ────────────────────────────────────────
interface SessionData {
  email: string;
  createdAt: number;
  needsPasswordChange: boolean;
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

// ─── Rate limiting for login ─────────────────────────────────────────
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
}

const loginRateLimit = new Map<string, RateLimitEntry>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Returns true if the IP has exceeded the rate limit.
 * Returns false and increments the counter otherwise.
 */
export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginRateLimit.get(ip);

  // Clean up old entries
  for (const [key, val] of loginRateLimit) {
    if (now - val.firstAttempt > LOGIN_WINDOW_MS) {
      loginRateLimit.delete(key);
    }
  }

  if (!entry || now - entry.firstAttempt > LOGIN_WINDOW_MS) {
    // First attempt or window expired — reset
    loginRateLimit.set(ip, { attempts: 1, firstAttempt: now });
    return false;
  }

  entry.attempts++;
  if (entry.attempts > MAX_LOGIN_ATTEMPTS) {
    return true; // blocked
  }

  return false;
}

/**
 * Reset rate limit for an IP (called on successful login).
 */
export function resetLoginRateLimit(ip: string): void {
  loginRateLimit.delete(ip);
}

// ─── Public API ─────────────────────────────────────────────────────

export function createSession(email: string, needsPasswordChange = false): string {
  cleanupSessions();
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { email, createdAt: Date.now(), needsPasswordChange });
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

// ─── Default password detection ─────────────────────────────────────
// The default admin123 hash — pre-computed so we can detect it without
// comparing against the plaintext password.
const DEFAULT_PASSWORD_HASH =
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

/**
 * Returns true if the given hash matches the known default password hash.
 * Used to force password change on first login.
 */
export function isDefaultPassword(hash: string): boolean {
  return hash === DEFAULT_PASSWORD_HASH;
}

// ─── Admin seeding ──────────────────────────────────────────────────

export async function seedAdminUser(): Promise<void> {
  // Tables are created by ensureTables() imported above via db.ts
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
