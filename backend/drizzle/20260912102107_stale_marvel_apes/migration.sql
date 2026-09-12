CREATE TABLE "brand_translation" (
	"brand_id" uuid,
	"locale" varchar(8),
	"description" text,
	CONSTRAINT "brand_translation_pkey" PRIMARY KEY("brand_id","locale")
);
--> statement-breakpoint
CREATE TABLE "category_translation" (
	"category_id" uuid,
	"locale" varchar(8),
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "category_translation_pkey" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_translation" (
	"product_id" uuid,
	"locale" varchar(8),
	"name" text NOT NULL,
	"short_description" text,
	"description" jsonb,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "product_translation_pkey" PRIMARY KEY("product_id","locale")
);
--> statement-breakpoint
CREATE INDEX "brand_translation_brand_locale_idx" ON "brand_translation" ("brand_id","locale");--> statement-breakpoint
CREATE INDEX "category_translation_category_locale_idx" ON "category_translation" ("category_id","locale");--> statement-breakpoint
CREATE INDEX "product_translation_product_locale_idx" ON "product_translation" ("product_id","locale");--> statement-breakpoint
ALTER TABLE "brand_translation" ADD CONSTRAINT "brand_translation_brand_id_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "category_translation" ADD CONSTRAINT "category_translation_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_translation" ADD CONSTRAINT "product_translation_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE;--> statement-breakpoint
INSERT INTO "product_translation" ("product_id", "locale", "name", "short_description", "description") SELECT "id", 'vi', "name_vi", "short_description_vi", "description_vi" FROM "product" ON CONFLICT ("product_id", "locale") DO NOTHING;--> statement-breakpoint
INSERT INTO "product_translation" ("product_id", "locale", "name", "short_description", "description") SELECT "id", 'en', "name_en", "short_description_en", "description_en" FROM "product" WHERE "name_en" IS NOT NULL AND TRIM("name_en") <> '' ON CONFLICT ("product_id", "locale") DO NOTHING;--> statement-breakpoint
INSERT INTO "category_translation" ("category_id", "locale", "name", "description") SELECT "id", 'vi', "name_vi", "description_vi" FROM "category" ON CONFLICT ("category_id", "locale") DO NOTHING;--> statement-breakpoint
INSERT INTO "category_translation" ("category_id", "locale", "name", "description") SELECT "id", 'en', "name_en", "description_en" FROM "category" WHERE "name_en" IS NOT NULL AND TRIM("name_en") <> '' ON CONFLICT ("category_id", "locale") DO NOTHING;--> statement-breakpoint
INSERT INTO "brand_translation" ("brand_id", "locale", "description") SELECT "id", 'vi', "description_vi" FROM "brand" WHERE "description_vi" IS NOT NULL ON CONFLICT ("brand_id", "locale") DO NOTHING;--> statement-breakpoint
INSERT INTO "brand_translation" ("brand_id", "locale", "description") SELECT "id", 'en', "description_en" FROM "brand" WHERE "description_en" IS NOT NULL ON CONFLICT ("brand_id", "locale") DO NOTHING;