import { z } from 'zod';

const DayEnum = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

export const ScheduleItemSchema = z.object({
  day: DayEnum,
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
});

export const ReviewSchema = z.object({
  author: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  date: z.string(),
});

export const AvailabilitySchema = z.object({
  homeService: z.boolean().default(false),
  emergency: z.boolean().default(false),
  days: z.array(z.enum(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'])).optional(),
  hours: z.string().optional(),
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
  experience: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  reviews: z.array(ReviewSchema).optional(),
  rating: z.number().min(0).max(5).optional(),
  availability: AvailabilitySchema.optional(),
  quoteMethod: z.enum(['presencial', 'telefonica', 'whatsapp', 'online']).optional(),
});

export const CategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string().optional(),
  search_terms: z.array(z.string()).optional().default([]),
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
export type Review = z.infer<typeof ReviewSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
