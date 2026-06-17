CREATE TYPE "debt_repayment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "debt_repayment" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"amount" numeric(15,2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "debt_repayment_status" DEFAULT 'PENDING'::"debt_repayment_status" NOT NULL,
	"reference_code" text NOT NULL UNIQUE,
	"verified_by" uuid
);
--> statement-breakpoint
ALTER TABLE "debt_repayment" ADD CONSTRAINT "debt_repayment_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "debt_repayment" ADD CONSTRAINT "debt_repayment_verified_by_user_id_fkey" FOREIGN KEY ("verified_by") REFERENCES "user"("id") ON DELETE SET NULL;