/**
 * CSRF protection via Origin/Referer header validation.
 *
 * Astro API routes use SameSite=Lax cookies for auth, which blocks
 * cross-site POSTs in modern browsers. This module adds an extra layer
 * of defense by validating the Origin header on all mutation endpoints.
 *
 * Reference: security/csrf-protection.md
 */

const ALLOWED_ORIGINS = [
  import.meta.env.SITE_URL,
  import.meta.env.PUBLIC_SITE_URL,
  'http://localhost:4321',
  'http://localhost:4322',
  'http://127.0.0.1:4321',
].filter(Boolean) as string[];

/**
 * Validate that the request's Origin or Referer header matches
 * an allowed origin. Returns true if the origin is valid.
 *
 * Both headers must be validated because:
 * - Origin is sent on cross-origin requests
 * - Referer may be stripped by some browsers/proxies
 * - Having neither is suspicious for a browser POST
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Check Origin header first (most reliable)
  if (origin) {
    return ALLOWED_ORIGINS.some(
      (allowed) => origin === allowed || origin.startsWith(allowed),
    );
  }

  // Fall back to Referer header
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return ALLOWED_ORIGINS.some(
        (allowed) => refererOrigin === allowed || refererOrigin.startsWith(allowed),
      );
    } catch {
      return false;
    }
  }

  // No Origin and no Referer: could be a direct API call from curl/Postman
  // or a privacy-focused browser that strips Referer.
  // In development, allow it. In production, reject.
  return import.meta.env.DEV === true;
}

/**
 * CSRF guard for Astro API routes.
 * Returns a 403 Response if the origin is invalid, or null if OK.
 *
 * Usage in an Astro API route:
 * ```ts
 * const csrfError = csrfGuard(request);
 * if (csrfError) return csrfError;
 * ```
 */
export function csrfGuard(request: Request): Response | null {
  if (request.method !== 'POST' && request.method !== 'PUT' && request.method !== 'PATCH' && request.method !== 'DELETE') {
    return null;
  }

  if (!validateOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Invalid origin' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null;
}
