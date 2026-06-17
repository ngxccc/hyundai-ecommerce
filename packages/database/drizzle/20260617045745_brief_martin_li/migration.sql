ALTER TABLE "debt_repayment" ADD COLUMN "order_code" bigint;--> statement-breakpoint
ALTER TABLE "debt_repayment" ALTER COLUMN "reference_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "debt_repayment" ADD CONSTRAINT "debt_repayment_order_code_key" UNIQUE("order_code");