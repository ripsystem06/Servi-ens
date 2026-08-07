import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const adminUsers = sqliteTable('admin_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const banners = sqliteTable('banners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  image: text('image').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  link: text('link').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  targetCategory: text('target_category'),
  slot: text('slot', { enum: ['sidebar-left', 'sidebar-right', 'profile'] }).notNull(),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  zone: text('zone').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  description: text('description').notNull(),
  services: text('services'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  adminNotes: text('admin_notes'),
  termsAcceptedAt: text('terms_accepted_at').default(sql`(datetime('now'))`),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});
