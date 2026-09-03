ALTER TABLE "movie_translations" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "movie_translations" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cinemas" ALTER COLUMN "city" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cinemas" ALTER COLUMN "ward" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cinemas" ALTER COLUMN "street_address" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movie_translations_title_idx" ON "movie_translations" ("title");