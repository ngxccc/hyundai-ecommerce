CREATE TYPE "quote_status" AS ENUM('pending_review', 'negotiating', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TABLE "quote_item" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"quote_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"requested_price" numeric(15,2) NOT NULL,
	"agreed_price" numeric(15,2)
);
--> statement-breakpoint
CREATE TABLE "quote_message" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"quote_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "quote_status" DEFAULT 'pending_review'::"quote_status" NOT NULL,
	"total_quoted_price" numeric(15,2),
	"expiration_date" timestamp with time zone,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "quote_item" ADD CONSTRAINT "quote_item_quote_id_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quote_item" ADD CONSTRAINT "quote_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quote_message" ADD CONSTRAINT "quote_message_quote_id_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quote_message" ADD CONSTRAINT "quote_message_sender_id_user_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT;