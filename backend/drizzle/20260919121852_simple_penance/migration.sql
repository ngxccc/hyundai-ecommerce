CREATE TABLE "company_setting" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"legal_name_vi" varchar(255) NOT NULL,
	"legal_name_en" varchar(255) NOT NULL,
	"short_name" varchar(100) NOT NULL,
	"brand_name" varchar(100) NOT NULL,
	"brand_title" varchar(150) NOT NULL,
	"brand_full_name" varchar(255) NOT NULL,
	"tax_id" varchar(50) NOT NULL,
	"hotlines" jsonb NOT NULL,
	"emails" jsonb NOT NULL,
	"addresses" jsonb NOT NULL,
	"working_hours" jsonb NOT NULL,
	"links" jsonb NOT NULL,
	"bank" jsonb NOT NULL
);
