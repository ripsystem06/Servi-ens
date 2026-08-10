CREATE TYPE "public"."ad_inquiry_status" AS ENUM('pending', 'contacted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."ad_interest" AS ENUM('banner-home', 'banner-categoria', 'banner-lateral', 'perfil-destacado', 'no-se');--> statement-breakpoint
CREATE TYPE "public"."banner_slot" AS ENUM('sidebar-left', 'sidebar-right', 'profile');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "ad_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"business" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"interest" "ad_interest" NOT NULL,
	"message" text DEFAULT '',
	"status" "ad_inquiry_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"image" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"link" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"target_category" text,
	"slot" "banner_slot" NOT NULL,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"zone" text NOT NULL,
	"description" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"website" text,
	"address" text DEFAULT '' NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"services" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"verified" boolean DEFAULT false NOT NULL,
	"destacado" boolean DEFAULT false NOT NULL,
	"experience" text,
	"certifications" jsonb DEFAULT '[]'::jsonb,
	"schedule" jsonb DEFAULT '[]'::jsonb,
	"availability" jsonb,
	"quote_method" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"author_name" text NOT NULL,
	"author_surname" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"status" "review_status" DEFAULT 'approved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"zone" text NOT NULL,
	"phone" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"description" text NOT NULL,
	"services" text,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"terms_accepted_at" timestamp with time zone,
	"business_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_slug_businesses_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."businesses"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ad_inquiries_status" ON "ad_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_banners_slot" ON "banners" USING btree ("slot");--> statement-breakpoint
CREATE INDEX "idx_banners_dates" ON "banners" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_banners_target_category" ON "banners" USING btree ("target_category");--> statement-breakpoint
CREATE INDEX "idx_businesses_category" ON "businesses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_businesses_zone" ON "businesses" USING btree ("zone");--> statement-breakpoint
CREATE INDEX "idx_businesses_verified" ON "businesses" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "idx_businesses_destacado" ON "businesses" USING btree ("destacado");--> statement-breakpoint
CREATE INDEX "idx_reviews_business_slug" ON "reviews" USING btree ("business_slug");--> statement-breakpoint
CREATE INDEX "idx_reviews_status" ON "reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reviews_business_status" ON "reviews" USING btree ("business_slug","status");--> statement-breakpoint
CREATE INDEX "idx_submissions_status" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_submissions_created_at" ON "submissions" USING btree ("created_at");