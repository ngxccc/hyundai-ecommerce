ALTER TABLE "product" DROP COLUMN "specs";--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "product_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "quantity" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_quantity_positive_check" CHECK ("quantity" > 0);