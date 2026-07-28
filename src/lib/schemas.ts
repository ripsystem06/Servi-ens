import { z } from 'zod';

const DayEnum = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

export const ScheduleItemSchema = z.object({
  day: DayEnum,
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
});

export const BusinessSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: z.string(),
  zone: z.string(),
  description: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  photos: z.array(z.string()).optional(),
  schedule: z.array(ScheduleItemSchema).optional(),
  services: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  verified: z.boolean(),
  destacado: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string().optional(),
  order: z.number(),
});

export const ZoneSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  order: z.number(),
});

export const SiteConfigSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  url: z.string().url(),
  locale: z.string(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
  }),
  social: z.object({
    facebook: z.string().url(),
    instagram: z.string().url(),
  }),
});

export type Business = z.infer<typeof BusinessSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Zone = z.infer<typeof ZoneSchema>;
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
