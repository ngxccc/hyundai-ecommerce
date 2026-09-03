CREATE TYPE "booking_status" AS ENUM('pending_payment', 'confirmed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "discount_type" AS ENUM('percentage', 'flat');--> statement-breakpoint
CREATE TYPE "movie_rating" AS ENUM('G', 'PG', 'PG_13', 'R', 'NC_17');--> statement-breakpoint
CREATE TYPE "outbox_event_status" AS ENUM('pending', 'processed', 'failed');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('MOMO', 'VNPAY', 'Credit_Card', 'ShopeePay', 'PAYOS');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded', 'requires_refund');--> statement-breakpoint
CREATE TYPE "show_seat_status" AS ENUM('available', 'reserved', 'booked');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('user', 'admin', 'staff');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('active', 'inactive', 'suspended', 'pending_verification');--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"device_name" varchar(255),
	"ip_address" varchar(45),
	"expires_at" timestamp with time zone NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"avatar_url" text,
	"password_hash" text,
	"google_id" varchar(255),
	"facebook_id" varchar(255),
	"role" "user_role" DEFAULT 'user'::"user_role" NOT NULL,
	"status" "user_status" DEFAULT 'pending_verification'::"user_status" NOT NULL,
	"verification_token" varchar(255),
	"verification_expires_at" timestamp with time zone,
	"reset_password_token" varchar(255),
	"reset_password_expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" uuid PRIMARY KEY,
	"name" varchar(100) NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "movie_genres" (
	"movie_id" uuid,
	"genre_id" uuid,
	CONSTRAINT "movie_genres_pkey" PRIMARY KEY("movie_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "movie_translations" (
	"movie_id" uuid,
	"language_code" varchar(10),
	"title" varchar(255) NOT NULL,
	"description" text,
	CONSTRAINT "movie_translations_pkey" PRIMARY KEY("movie_id","language_code")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tmdb_id" varchar(50) UNIQUE,
	"imdb_id" varchar(50) UNIQUE,
	"duration_minutes" integer NOT NULL,
	"release_date" date,
	"poster_url" text,
	"trailer_url" text,
	"rating" "movie_rating"
);
--> statement-breakpoint
CREATE TABLE "cinemas" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "halls" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cinema_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"total_seats" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seat_types" (
	"id" uuid PRIMARY KEY,
	"name" varchar(50) NOT NULL UNIQUE,
	"price_multiplier" numeric(4,2) DEFAULT '1.00' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"hall_id" uuid NOT NULL,
	"seat_type_id" uuid NOT NULL,
	"row" varchar(10) NOT NULL,
	"number" integer NOT NULL,
	"seat_number" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "show_seats" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"show_id" uuid NOT NULL,
	"seat_id" uuid NOT NULL,
	"status" "show_seat_status" DEFAULT 'available'::"show_seat_status" NOT NULL,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "shows" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"movie_id" uuid NOT NULL,
	"hall_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"base_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_combos" (
	"booking_id" uuid,
	"combo_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "booking_combos_pkey" PRIMARY KEY("booking_id","combo_id")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"show_id" uuid NOT NULL,
	"voucher_id" uuid,
	"original_price" integer NOT NULL,
	"discount_price" integer DEFAULT 0 NOT NULL,
	"total_price" integer NOT NULL,
	"status" "booking_status" DEFAULT 'pending_payment'::"booking_status" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"order_code" bigint
);
--> statement-breakpoint
CREATE TABLE "combos" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"booking_id" uuid NOT NULL,
	"show_seat_id" uuid NOT NULL,
	"ticket_code" varchar(100) NOT NULL UNIQUE,
	"final_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"code" varchar(50) NOT NULL UNIQUE,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" integer NOT NULL,
	"min_booking_amount" integer DEFAULT 0 NOT NULL,
	"max_discount_amount" integer,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"booking_id" uuid NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"transaction_id" varchar(255),
	"amount" integer NOT NULL,
	"status" "payment_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_type" varchar(255) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "outbox_event_status" DEFAULT 'pending'::"outbox_event_status" NOT NULL,
	"processed_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_token_hash_uidx" ON "refresh_tokens" ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uidx" ON "users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_id_uidx" ON "users" ("google_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_facebook_id_uidx" ON "users" ("facebook_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_verification_token_uidx" ON "users" ("verification_token");--> statement-breakpoint
CREATE INDEX "users_verification_expires_at_idx" ON "users" ("verification_expires_at") WHERE "status" = 'pending_verification';--> statement-breakpoint
CREATE UNIQUE INDEX "users_reset_password_token_uidx" ON "users" ("reset_password_token");--> statement-breakpoint
CREATE INDEX "users_reset_password_expires_at_idx" ON "users" ("reset_password_expires_at") WHERE "reset_password_token" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "users_phone_number_idx" ON "users" ("phone_number");--> statement-breakpoint
CREATE INDEX "movie_genres_genre_id_idx" ON "movie_genres" ("genre_id");--> statement-breakpoint
CREATE INDEX "halls_cinema_id_idx" ON "halls" ("cinema_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seats_hall_id_seat_number_uidx" ON "seats" ("hall_id","seat_number");--> statement-breakpoint
CREATE INDEX "seats_seat_type_id_idx" ON "seats" ("seat_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "show_seats_show_id_seat_id_uidx" ON "show_seats" ("show_id","seat_id");--> statement-breakpoint
CREATE INDEX "show_seats_status_locked_until_idx" ON "show_seats" ("status","locked_until");--> statement-breakpoint
CREATE INDEX "shows_movie_id_start_time_idx" ON "shows" ("movie_id","start_time");--> statement-breakpoint
CREATE INDEX "shows_hall_id_start_time_idx" ON "shows" ("hall_id","start_time");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_order_code_uidx" ON "bookings" ("order_code");--> statement-breakpoint
CREATE INDEX "bookings_user_id_created_at_idx" ON "bookings" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "bookings_show_id_idx" ON "bookings" ("show_id");--> statement-breakpoint
CREATE INDEX "bookings_voucher_id_idx" ON "bookings" ("voucher_id");--> statement-breakpoint
CREATE INDEX "bookings_status_expires_at_idx" ON "bookings" ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_ticket_code_uidx" ON "tickets" ("ticket_code");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_booking_id_show_seat_id_uidx" ON "tickets" ("booking_id","show_seat_id");--> statement-breakpoint
CREATE INDEX "tickets_show_seat_id_idx" ON "tickets" ("show_seat_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_transaction_id_uidx" ON "payments" ("transaction_id");--> statement-breakpoint
CREATE INDEX "payments_booking_id_idx" ON "payments" ("booking_id");--> statement-breakpoint
CREATE INDEX "outbox_events_status_created_at_idx" ON "outbox_events" ("status","created_at");--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "movie_translations" ADD CONSTRAINT "movie_translations_movie_id_movies_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "halls" ADD CONSTRAINT "halls_cinema_id_cinemas_id_fkey" FOREIGN KEY ("cinema_id") REFERENCES "cinemas"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_hall_id_halls_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "halls"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_seat_type_id_seat_types_id_fkey" FOREIGN KEY ("seat_type_id") REFERENCES "seat_types"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_show_id_shows_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_seat_id_seats_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_movie_id_movies_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_hall_id_halls_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "halls"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "booking_combos" ADD CONSTRAINT "booking_combos_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "booking_combos" ADD CONSTRAINT "booking_combos_combo_id_combos_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combos"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_show_id_shows_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_voucher_id_vouchers_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_show_seat_id_show_seats_id_fkey" FOREIGN KEY ("show_seat_id") REFERENCES "show_seats"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.show_occupied_range(start_t timestamptz, end_t timestamptz)
RETURNS tstzrange AS $$
  SELECT tstzrange(start_t, end_t + interval '15 minutes', '[)');
$$ LANGUAGE sql IMMUTABLE;--> statement-breakpoint
ALTER TABLE "shows" DROP CONSTRAINT IF EXISTS "no_hall_schedule_overlap";--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "no_hall_schedule_overlap"
EXCLUDE USING gist (
  hall_id WITH =,
  public.show_occupied_range(start_time, end_time) WITH &&
);
