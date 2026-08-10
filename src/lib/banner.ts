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
 * Filters by date range and optional category.
 * If multiple candidates exist, returns one via deterministic round-robin.
 */
export async function getBannerForSlot(
  slot: string,
  category?: string,
): Promise<Banner | null> {
  const today = new Date().toISOString().split('T')[0];

  const slotValue = slot as 'sidebar-left' | 'sidebar-right' | 'profile';

  const conditions = [
    eq(banners.slot, slotValue),
    lte(banners.startDate, today),
    gte(banners.endDate, today),
  ];

  const results = (await db
    .select()
    .from(banners)
    .where(and(...conditions))) as Banner[];

  const filtered = category
    ? results.filter(
        (b) => b.targetCategory === null || b.targetCategory === category,
      )
    : results;

  // Normalize orphaned categories
  const ORPHANED_CATEGORIES = ['restaurantes', 'hoteles', 'tiendas'];
  const normalized = filtered.map((b) => ({
    ...b,
    targetCategory: ORPHANED_CATEGORIES.includes(b.targetCategory ?? '')
      ? null
      : b.targetCategory,
  }));

  if (normalized.length === 0) return null;
  if (normalized.length === 1) return normalized[0];

  // Deterministic round-robin
  const totalImpressions = normalized.reduce(
    (sum, b) => sum + b.impressions + b.clicks,
    0,
  );
  const index = totalImpressions % normalized.length;
  return normalized[index];
}

/** Increment impression count for a banner. */
export async function incrementImpressions(bannerId: number): Promise<void> {
  await db
    .update(banners)
    .set({ impressions: sql`${banners.impressions} + 1` })
    .where(eq(banners.id, bannerId));
}

/** Increment click count for a banner and return its link URL. */
export async function incrementClicks(
  bannerId: number,
): Promise<string | null> {
  await db
    .update(banners)
    .set({ clicks: sql`${banners.clicks} + 1` })
    .where(eq(banners.id, bannerId));

  const result = await db
    .select({ link: banners.link })
    .from(banners)
    .where(eq(banners.id, bannerId))
    .limit(1);

  return result.length > 0 ? result[0].link : null;
}
