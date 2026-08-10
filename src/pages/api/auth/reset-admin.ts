export const prerender = false;

import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const scrypt = promisify(crypto.scrypt);

export async function POST({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = (formData.get('email') as string).trim();
  const password = (formData.get('password') as string).trim();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'email and password required' }), { status: 400 });
  }

  // Generate scrypt hash
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64) as Buffer;
  const hash = `${salt}:${derived.toString('hex')}`;

  // Update or insert
  const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);

  if (existing.length > 0) {
    await db.update(adminUsers).set({ passwordHash: hash }).where(eq(adminUsers.email, email));
    return new Response(JSON.stringify({ ok: true, action: 'updated', email }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  await db.insert(adminUsers).values({ email, passwordHash: hash });
  return new Response(JSON.stringify({ ok: true, action: 'created', email }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
