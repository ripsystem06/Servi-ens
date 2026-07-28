import { defineMiddleware } from 'astro:middleware';
import { validateSession } from '@/lib/auth';

const PROTECTED_PREFIX = '/admin';
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/api/auth'];

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  // Only guard admin routes
  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return next();
  }

  // Allow public admin paths (login page, auth API)
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return next();
  }

  // Allow static assets (CSS, JS, images) under /admin
  if (pathname.startsWith('/admin/_astro/') || pathname.startsWith('/admin/~')) {
    return next();
  }

  // Check session cookie
  const sessionCookie = context.cookies.get('session');
  if (!sessionCookie?.value) {
    const loginUrl = new URL('/admin/login', context.url);
    return Response.redirect(loginUrl, 302);
  }

  const sessionData = validateSession(sessionCookie.value);
  if (!sessionData) {
    const loginUrl = new URL('/admin/login', context.url);
    return Response.redirect(loginUrl, 302);
  }

  return next();
});
