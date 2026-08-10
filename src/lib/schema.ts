import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ── Enums ────────────────────────────────────────────────────────────

export const submissionStatusEnum = pgEnum('submission_status', [
  'pending',
  'approved',
  'rejected',
]);

export const reviewStatusEnum = pgEnum('review_status', [
  'pending',
  'approved',
  'rejected',
]);

export const bannerSlotEnum = pgEnum('banner_slot', [
  'sidebar-left',
  'sidebar-right',
  'profile',
]);

export const adInquiryStatusEnum = pgEnum('ad_inquiry_status', [
  'pending',
  'contacted',
  'closed',
]);

export const adInterestEnum = pgEnum('ad_interest', [
  'banner-home',
  'banner-categoria',
  'banner-lateral',
  'perfil-destacado',
  'no-se',
]);

// ── Tables ───────────────────────────────────────────────────────────

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const businesses = pgTable(
  'businesses',
  {
    id: text('id').primaryKey(), // biz-001, biz-002, etc.
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    zone: text('zone').notNull(),
    description: text('description').notNull(),
    phone: text('phone').notNull().default(''),
    email: text('email').notNull().default(''),
    website: text('website'),
    address: text('address').notNull().default(''),
    photos: jsonb('photos').$type<string[]>().default([]),
    services: jsonb('services').$type<string[]>().default([]),
    tags: jsonb('tags').$type<string[]>().default([]),
    verified: boolean('verified').default(false).notNull(),
    destacado: boolean('destacado').default(false).notNull(),
    experience: text('experience'),
    certifications: jsonb('certifications').$type<string[]>().default([]),
    schedule: jsonb('schedule').$type<ScheduleItem[]>().default([]),
    availability: jsonb('availability').$type<Availability | null>(),
    quoteMethod: text('quote_method'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_businesses_category').on(table.category),
    index('idx_businesses_zone').on(table.zone),
    index('idx_businesses_verified').on(table.verified),
    index('idx_businesses_destacado').on(table.destacado),
  ],
);

export const banners = pgTable(
  'banners',
  {
    id: serial('id').primaryKey(),
    image: text('image').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    link: text('link').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    targetCategory: text('target_category'),
    slot: bannerSlotEnum('slot').notNull(),
    impressions: integer('impressions').default(0),
    clicks: integer('clicks').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_banners_slot').on(table.slot),
    index('idx_banners_dates').on(table.startDate, table.endDate),
    index('idx_banners_target_category').on(table.targetCategory),
  ],
);

export const submissions = pgTable(
  'submissions',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    zone: text('zone').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull().default(''),
    description: text('description').notNull(),
    services: text('services'),
    website: text('website'),
    address: text('address'),
    status: submissionStatusEnum('status').notNull().default('pending'),
    adminNotes: text('admin_notes'),
    termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
    businessId: text('business_id').references(() => businesses.id),
    photoUrl: text('photo_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_submissions_status').on(table.status),
    index('idx_submissions_created_at').on(table.createdAt),
  ],
);

export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    businessSlug: text('business_slug')
      .notNull()
      .references(() => businesses.slug, { onDelete: 'cascade' }),
    authorName: text('author_name').notNull(),
    authorSurname: text('author_surname').notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    status: reviewStatusEnum('status').notNull().default('approved'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_reviews_business_slug').on(table.businessSlug),
    index('idx_reviews_status').on(table.status),
    index('idx_reviews_business_status').on(table.businessSlug, table.status),
  ],
);

export const adInquiries = pgTable(
  'ad_inquiries',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    business: text('business').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    interest: adInterestEnum('interest').notNull(),
    message: text('message').default(''),
    status: adInquiryStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_ad_inquiries_status').on(table.status),
  ],
);

// ── Types ─────────────────────────────────────────────────────────────

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
