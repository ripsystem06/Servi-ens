export const prerender = false;

// Test: import auth.ts but don't use bcrypt
import { validateSession, createSession } from '@/lib/auth';

export async function POST({ request, cookies }: any) {
  const formData = await request.formData();
  const email = formData.get('email') || '';

  // Just test DB query + session, no bcrypt
  const { db } = await import('@/lib/db');
  const { adminUsers } = await import('@/lib/schema');
  const { eq } = await import('drizzle-orm');
  
  const user = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  
  if (user.length === 0) {
    return new Response(JSON.stringify({ ok: false, reason: 'not found', email }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Don't check password - just create session
  const sessionId = createSession(email, false);
  cookies.set('session', sessionId, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 86400,
  });

  return new Response(JSON.stringify({ ok: true, email, sessionCreated: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
