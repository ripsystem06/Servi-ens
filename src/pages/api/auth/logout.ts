export const prerender = false;

import type { APIRoute } from 'astro';
import { destroySession } from '@/lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionCookie = cookies.get('session');
  if (sessionCookie?.value) {
    destroySession(sessionCookie.value);
  }
  cookies.delete('session', { path: '/' });
  return redirect('/admin/login', 302);
};
