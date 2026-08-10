import { db } from './db';
import { adminUsers } from './schema';
import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);

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

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Check if it's a legacy bcrypt hash (starts with $2a$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    // Dynamic import of bcryptjs only for legacy hashes
    try {
      const bcrypt = await import('bcryptjs');
      return bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  const derived = await scrypt(password, salt, 64) as Buffer;
  return crypto.timingSafeEqual(derived, Buffer.from(key, 'hex'));
}

// ─── Default password detection ─────────────────────────────────────
// NOTE: Default password detection only works with legacy bcrypt hashes.
// After the first login with scrypt, this will be bypassed.
const DEFAULT_PASSWORD_HASH =
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export function isDefaultPassword(hash: string): boolean {
  // Only match legacy bcrypt format
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return hash === DEFAULT_PASSWORD_HASH;
  }
  return false;
}

// ─── Admin seeding ──────────────────────────────────────────────────

export async function seedAdminUser(): Promise<void> {
  const existing = await db.select().from(adminUsers).limit(1);
  if (existing.length > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('[auth] ADMIN_EMAIL and ADMIN_PASSWORD env vars required for first-time setup. Skipping admin seed.');
    return;
  }

  const passwordHash = await hashPassword(password);

  await db.insert(adminUsers).values({
    email,
    passwordHash,
  });

  console.log('[auth] Admin user seeded successfully');
}

// Auto-seed on first import (module-level side effect)
// Disabled: Hostinger times out on cold start. Run npx drizzle-kit push manually.
// seedAdminUser().catch((err) => {
//   console.error('[auth] Failed to seed admin user:', err);
// });
