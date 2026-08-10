export const prerender = false;

import type { APIRoute } from 'astro';
import { getBannerForSlot, incrementImpressions } from '@/lib/banner';
import { BANNER_SLOTS, type BannerSlot } from '@/lib/constants';

/**
 * GET /api/banner/slot?slot=<slot>&category=<category>
 * Returns an HTML fragment for the selected banner, or 204 if none available.
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const slotParam = url.searchParams.get('slot') || '';
  const category = url.searchParams.get('category') || undefined;

  // Validate slot
  if (!(BANNER_SLOTS as readonly string[]).includes(slotParam)) {
    return new Response(null, { status: 204 });
  }

  const slot = slotParam as BannerSlot;
  const banner = await getBannerForSlot(slot, category);

  if (!banner) {
    return new Response(null, { status: 204 });
  }

  // Track impression
  await incrementImpressions(banner.id);

  const html = renderBannerCard(banner);

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

function renderBannerCard(banner: {
  id: number;
  image: string;
  title: string;
  description: string;
  link: string;
}): string {
  return `<!-- Banner ${banner.id} -->
<a
  href="/api/banner/${banner.id}/click"
  class="block group rounded-xl overflow-hidden bg-white shadow-coastal border border-outline-card hover-lift transition-colors"
  rel="sponsored noopener"
>
  <div class="relative aspect-[4/3] bg-surface-container-low overflow-hidden">
    <img
      src="${escapeAttr(banner.image)}"
      alt="${escapeAttr(banner.title)}"
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
      width="400"
      height="300"
    />
    <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-high/90 text-on-surface-variant text-label-sm font-medium backdrop-blur-sm">
      PROMOVIDO
    </span>
  </div>
  <div class="p-4">
    <h3 class="font-headline text-headline-md text-primary mb-1 group-hover:text-secondary transition-colors line-clamp-1">
      ${escapeHtml(banner.title)}
    </h3>
    <p class="text-label-md text-on-surface-variant line-clamp-2 mb-3">
      ${escapeHtml(banner.description)}
    </p>
    <span class="inline-flex items-center gap-1 text-label-sm font-semibold text-secondary group-hover:underline">
      Ver más
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </span>
  </div>
</a>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
