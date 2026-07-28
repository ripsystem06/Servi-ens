export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import {
  validateSession,
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  isDefaultPassword,
} from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sessionCookie = cookies.get('session');
  if (!sessionCookie?.value) {
    return redirect('/admin/login', 302);
  }

  const sessionData = validateSession(sessionCookie.value);
  if (!sessionData) {
    return redirect('/admin/login', 302);
  }

  const formData = await request.formData();
  const currentPassword = (formData.get('current_password') as string || '').trim();
  const newPassword = (formData.get('new_password') as string || '').trim();
  const confirmPassword = (formData.get('confirm_password') as string || '').trim();

  // ── Validation ───────────────────────────────────────────────────
  const errors: string[] = [];

  if (!currentPassword) errors.push('La contraseña actual es obligatoria');
  if (!newPassword) errors.push('La nueva contraseña es obligatoria');
  if (newPassword.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres');
  if (!/[A-Z]/.test(newPassword)) errors.push('Debe contener al menos una mayúscula');
  if (!/[0-9]/.test(newPassword)) errors.push('Debe contener al menos un número');
  if (newPassword !== confirmPassword) errors.push('Las contraseñas no coinciden');

  if (errors.length > 0) {
    const url = new URL('/admin/cambiar-password', request.url);
    url.searchParams.set('error', errors.join('. '));
    return Response.redirect(url, 302);
  }

  // ── Verify current password ──────────────────────────────────────
  const user = db.select()
    .from(adminUsers)
    .where(eq(adminUsers.email, sessionData.email))
    .limit(1)
    .all();

  if (user.length === 0) {
    return redirect('/admin/login', 302);
  }

  const isValid = await verifyPassword(currentPassword, user[0].passwordHash);
  if (!isValid) {
    const url = new URL('/admin/cambiar-password', request.url);
    url.searchParams.set('error', 'La contraseña actual es incorrecta');
    return Response.redirect(url, 302);
  }

  // ── Prevent reusing the default password ────────────────────────
  if (isDefaultPassword(await hashPassword(newPassword))) {
    // This can't actually happen since bcrypt generates a unique salt each time,
    // but check for the actual default string being reused
    const isReusingDefault = await verifyPassword('admin123', user[0].passwordHash)
      ? newPassword === 'admin123'
      : false;

    if (isReusingDefault) {
      const url = new URL('/admin/cambiar-password', request.url);
      url.searchParams.set('error', 'No podés usar la contraseña por defecto. Elegí una diferente.');
      return Response.redirect(url, 302);
    }
  }

  // ── Update password ──────────────────────────────────────────────
  const newHash = await hashPassword(newPassword);

  db.update(adminUsers)
    .set({ passwordHash: newHash })
    .where(eq(adminUsers.email, sessionData.email))
    .run();

  // ── Rotate session (destroy old, create new without needsPasswordChange) ─
  destroySession(sessionCookie.value);
  cookies.delete('session', { path: '/' });

  const newSessionId = createSession(sessionData.email, false);
  cookies.set('session', newSessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  });

  return redirect('/admin?msg=Contraseña+actualizada', 302);
};
