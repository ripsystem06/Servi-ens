export const prerender = false;

import type { APIRoute } from 'astro';
import { incrementImpressions } from '@/lib/banner';

/**
 * POST /api/banner/{id}/impression
 * Increments impression counter for a banner. Returns 204 No Content.
 * Used as a client-side fetch from BannerSlot.astro to track when
 * the banner HTML is actually rendered in the DOM.
 */
export const POST: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '', 10);

  if (isNaN(id) || id <= 0) {
    return new Response(null, { status: 400 });
  }

  incrementImpressions(id);

  return new Response(null, { status: 204 });
};
