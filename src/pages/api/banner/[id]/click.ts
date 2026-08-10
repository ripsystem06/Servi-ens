export const prerender = false;

import type { APIRoute } from 'astro';
import { incrementClicks } from '@/lib/banner';

/**
 * GET /api/banner/{id}/click
 * Increments click counter and redirects to the banner's target URL.
 * No-JS fallback: the <a href> goes directly to this endpoint, which
 * still tracks the click before redirecting.
 */
export const GET: APIRoute = async ({ params, redirect }) => {
  const id = parseInt(params.id || '', 10);

  if (isNaN(id) || id <= 0) {
    return redirect('/', 302);
  }

  const link = await incrementClicks(id);

  if (!link) {
    // Banner not found — redirect home
    return redirect('/', 302);
  }

  return redirect(link, 302);
};
