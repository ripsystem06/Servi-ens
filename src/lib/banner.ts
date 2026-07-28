import { db } from './db';
import { banners } from './schema';
import { sql, eq, and, gte, lte } from 'drizzle-orm';

export interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
  link: string;
  startDate: string;
  endDate: string;
  targetCategory: string | null;
  slot: string;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query active banners for a given slot.
 * Filters by date range using SQLite `date('now')` and optional category.
 * If multiple candidates exist, returns one via deterministic round-robin
 * based on `(impressions + clicks) % candidates.length`.
 */
export function getBannerForSlot(slot: string, category?: string): Banner | null {
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

  // Cast slot to the column's union type for Drizzle eq compatibility
  const slotValue = slot as 'sidebar-left' | 'sidebar-right' | 'profile';

  const conditions = [
    eq(banners.slot, slotValue),
    lte(banners.startDate, today),
    gte(banners.endDate, today),
  ];

  const results = db
    .select()
    .from(banners)
    .where(and(...conditions))
    .all() as Banner[];

  // Filter by target_category if provided
  const filtered = category
    ? results.filter(
        (b) => b.targetCategory === null || b.targetCategory === category
      )
    : results;

  if (filtered.length === 0) return null;

  if (filtered.length === 1) return filtered[0];

  // Deterministic round-robin: (impressions + clicks) % N
  const totalImpressions = filtered.reduce(
    (sum, b) => sum + b.impressions + b.clicks,
    0
  );
  const index = totalImpressions % filtered.length;
  return filtered[index];
}

/**
 * Increment impression count for a banner.
 */
export function incrementImpressions(bannerId: number): void {
  db.update(banners)
    .set({ impressions: sql`${banners.impressions} + 1` })
    .where(eq(banners.id, bannerId))
    .run();
}

/**
 * Increment click count for a banner and return its link URL.
 * Returns null if the banner doesn't exist.
 */
export function incrementClicks(bannerId: number): string | null {
  db.update(banners)
    .set({ clicks: sql`${banners.clicks} + 1` })
    .where(eq(banners.id, bannerId))
    .run();

  const banner = db
    .select({ link: banners.link })
    .from(banners)
    .where(eq(banners.id, bannerId))
    .limit(1)
    .all();

  return banner.length > 0 ? banner[0].link : null;
}
