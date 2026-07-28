export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = (formData.get('email') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();

  // Validation
  if (!email) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'El correo es obligatorio');
    return Response.redirect(url, 302);
  }

  if (!password) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'La contraseña es obligatoria');
    url.searchParams.set('email', email);
    return Response.redirect(url, 302);
  }

  // Query user
  const user = db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1).all();
  if (user.length === 0) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'Credenciales inválidas');
    url.searchParams.set('email', email);
    return Response.redirect(url, 302);
  }

  // Verify password
  const isValid = await verifyPassword(password, user[0].passwordHash);
  if (!isValid) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'Credenciales inválidas');
    url.searchParams.set('email', email);
    return Response.redirect(url, 302);
  }

  // Create session
  const sessionId = createSession(email);
  cookies.set('session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  });

  return redirect('/admin', 302);
};
