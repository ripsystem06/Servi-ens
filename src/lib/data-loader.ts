import { z } from 'zod';
import businessesData from '@/data/businesses.json';
import categoriesData from '@/data/categories.json';
import zonesData from '@/data/zones.json';
import siteData from '@/data/site.json';
import {
  BusinessSchema,
  CategorySchema,
  ZoneSchema,
  SiteConfigSchema,
  type Business,
  type Category,
  type Zone,
  type SiteConfig,
} from './schemas';

const businesses = z.array(BusinessSchema).parse(businessesData);
const categories = z.array(CategorySchema).parse(categoriesData);
const zones = z.array(ZoneSchema).parse(zonesData);
const siteConfig = SiteConfigSchema.parse(siteData);

export function getBusinesses(): Business[] {
  return businesses;
}

export function getCategories(): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function getZones(): Zone[] {
  return [...zones].sort((a, b) => a.order - b.order);
}

export function getSiteConfig(): SiteConfig {
  return siteConfig;
}

export function getBusinessBySlug(slug: string): Business | undefined {
  return businesses.find((b) => b.slug === slug);
}

export function filterByCategory(categorySlug: string): Business[] {
  return businesses.filter((b) => b.category === categorySlug);
}

export function filterByZone(zoneSlug: string): Business[] {
  return businesses.filter((b) => b.zone === zoneSlug);
}

export function getFeaturedBusinesses(): Business[] {
  return businesses.filter((b) => b.destacado);
}

export function getPopularBusinesses(): Business[] {
  return businesses.filter((b) => b.verified).slice(0, 8);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getZoneBySlug(slug: string): Zone | undefined {
  return zones.find((z) => z.slug === slug);
}

export function getBusinessCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of businesses) {
    counts[b.category] = (counts[b.category] || 0) + 1;
  }
  return counts;
}

export function getBusinessCountByZone(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of businesses) {
    counts[b.zone] = (counts[b.zone] || 0) + 1;
  }
  return counts;
}
