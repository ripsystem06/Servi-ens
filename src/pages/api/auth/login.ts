export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import {
  verifyPassword,
  createSession,
  checkLoginRateLimit,
  resetLoginRateLimit,
  isDefaultPassword,
} from '@/lib/auth';
import { csrfGuard } from '@/lib/csrf';

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  return '127.0.0.1';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setFlashCookie(cookies: any, name: string, value: string): void {
  // Short-lived cookie for flash messages — expires in 10 seconds, just long
  // enough for the redirect to be processed.
  cookies.set(`flash_${name}`, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 10,
  });
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  console.log('[login] request received');

  // ── CSRF protection ────────────────────────────────────────────────
  const csrfError = csrfGuard(request);
  if (csrfError) {
    console.log('[login] CSRF blocked');
    return csrfError;
  }

  const formData = await request.formData();
  const email = (formData.get('email') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();
  const clientIP = getClientIP(request);

  console.log('[login] attempt for:', email, 'ip:', clientIP);

  // ── Rate limiting ────────────────────────────────────────────────
  if (checkLoginRateLimit(clientIP)) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'Demasiados intentos. Esperá 15 minutos.');
    return Response.redirect(url, 302);
  }

  // ── Validation ───────────────────────────────────────────────────
  if (!email) {
    setFlashCookie(cookies, 'email', email);
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'El correo es obligatorio');
    return Response.redirect(url, 302);
  }

  if (!password) {
    setFlashCookie(cookies, 'email', email);
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'La contraseña es obligatoria');
    return Response.redirect(url, 302);
  }

  // ── Query user ───────────────────────────────────────────────────
  console.log('[login] about to query DB');
  const user = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  console.log('[login] DB query done, rows:', user.length);

  if (user.length === 0) {
    setFlashCookie(cookies, 'email', email);
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'Credenciales inválidas');
    return Response.redirect(url, 302);
  }

  // ── Verify password ──────────────────────────────────────────────
  const isValid = await verifyPassword(password, user[0].passwordHash).catch((err) => {
    console.error('[login] bcrypt error:', err.message);
    return false;
  });

  if (!isValid) {
    setFlashCookie(cookies, 'email', email);
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'Credenciales inválidas');
    return Response.redirect(url, 302);
  }

  // ── Login successful ─────────────────────────────────────────────
  resetLoginRateLimit(clientIP);

  // Check if user has the default password — force change
  const needsPasswordChange = isDefaultPassword(user[0].passwordHash);

  const sessionId = createSession(email, needsPasswordChange);
  cookies.set('session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  });

  // Clear flash cookies
  cookies.delete('flash_email', { path: '/' });

  if (needsPasswordChange) {
    return redirect('/admin/cambiar-password', 302);
  }

  return redirect('/admin', 302);
};
