ALTER TABLE "payment_transaction" ADD COLUMN "order_code" bigint;--> statement-breakpoint
ALTER TABLE "payment_transaction" ALTER COLUMN "reference_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_order_code_key" UNIQUE("order_code");