import { db } from './db';
import { businesses } from './schema';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import categoriesData from '@/data/categories.json';
import zonesData from '@/data/zones.json';
import siteData from '@/data/site.json';
import {
  CategorySchema,
  ZoneSchema,
  SiteConfigSchema,
  type Category,
  type Zone,
  type SiteConfig,
} from './schemas';

// ── Static data (categories, zones, site config) ──────────────────
// These don't change often and are fine as JSON files.
const categories = z.array(CategorySchema).parse(categoriesData);
const zones = z.array(ZoneSchema).parse(zonesData);
const siteConfig = SiteConfigSchema.parse(siteData);

// ── Business type (matches the DB row shape) ─────────────────────
export interface BusinessRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  zone: string;
  description: string;
  phone: string;
  email: string;
  website: string | null;
  address: string;
  photos: string[];
  services: string[];
  tags: string[];
  verified: boolean;
  destacado: boolean;
  experience: string | null;
  certifications: string[];
  schedule: ScheduleItem[];
  availability: Availability | null;
  quoteMethod: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleItem {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

interface Availability {
  homeService?: boolean;
  emergency?: boolean;
  days?: string[];
  hours?: string;
}

// ── Read functions ──────────────────────────────────────────────

export function getCategories(): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function getZones(): Zone[] {
  return [...zones].sort((a, b) => a.order - b.order);
}

export function getSiteConfig(): SiteConfig {
  return siteConfig;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getZoneBySlug(slug: string): Zone | undefined {
  return zones.find((z) => z.slug === slug);
}

export async function getBusinesses(): Promise<BusinessRow[]> {
  const result = await db.select().from(businesses).orderBy(desc(businesses.createdAt));
  return Array.isArray(result) ? result as BusinessRow[] : [];
}

export async function getBusinessBySlug(slug: string): Promise<BusinessRow | undefined> {
  const rows = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, slug))
    .limit(1);
  return rows[0] as BusinessRow | undefined;
}

export async function filterByCategory(categorySlug: string): Promise<BusinessRow[]> {
  return await db
    .select()
    .from(businesses)
    .where(eq(businesses.category, categorySlug))
    .orderBy(desc(businesses.createdAt)) as unknown as BusinessRow[];
}

export async function filterByZone(zoneSlug: string): Promise<BusinessRow[]> {
  return await db
    .select()
    .from(businesses)
    .where(eq(businesses.zone, zoneSlug))
    .orderBy(desc(businesses.createdAt)) as unknown as BusinessRow[];
}

export async function getFeaturedBusinesses(): Promise<BusinessRow[]> {
  return await db
    .select()
    .from(businesses)
    .where(eq(businesses.destacado, true))
    .orderBy(desc(businesses.createdAt)) as unknown as BusinessRow[];
}

export async function getPopularBusinesses(): Promise<BusinessRow[]> {
  return await db
    .select()
    .from(businesses)
    .where(eq(businesses.verified, true))
    .limit(8)
    .orderBy(desc(businesses.createdAt)) as unknown as BusinessRow[];
}

export async function getBusinessCountByCategory(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      category: businesses.category,
      count: sql<number>`count(*)::int`,
    })
    .from(businesses)
    .groupBy(businesses.category);
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.category] = row.count;
  }
  return counts;
}

export async function getBusinessCountByZone(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      zone: businesses.zone,
      count: sql<number>`count(*)::int`,
    })
    .from(businesses)
    .groupBy(businesses.zone);
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.zone] = row.count;
  }
  return counts;
}
