import { LOG_LEVELS } from "@nestjs/common";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const ENVIRONMENT_MODES = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

const robustUrlSchema = z.preprocess((val) => {
  if (typeof val !== "string" || val === "") return undefined;
  if (!val.includes("://") && val.trim().length > 0) {
    return `https://${val}`;
  }
  return val;
}, z.url());

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(4000),
    DOMAIN_NAME: robustUrlSchema.catch("http://localhost:3000"),
    FRONTEND_URL: robustUrlSchema.catch("http://localhost:3000"),
    ADMIN_URL: robustUrlSchema.catch("http://localhost:3001"),
    NODE_ENV: z
      .preprocess(
        (val) => {
          if (val === "prod" || val === "prd")
            return ENVIRONMENT_MODES.PRODUCTION;
          if (val === "dev") return ENVIRONMENT_MODES.DEVELOPMENT;
          return val;
        },
        z.enum([
          ENVIRONMENT_MODES.DEVELOPMENT,
          ENVIRONMENT_MODES.PRODUCTION,
          ENVIRONMENT_MODES.TEST,
        ]),
      )
      .default(ENVIRONMENT_MODES.DEVELOPMENT),

    // Logging configuration
    LOG_LEVEL: z.enum(LOG_LEVELS).default("log"),

    // Database configuration
    DB_URL: robustUrlSchema.optional().catch(undefined),
    DB_HOST: z.string().default("localhost"),
    DB_PORT: z.coerce.number().default(5432),
    DB_USERNAME: z.string().default("postgres"),
    DB_PASSWORD: z.string().default("postgrespassword"),
    DB_DATABASE: z.string().default("hyundai_ecommerce"),
    DB_LOGGING: z
      .string()
      .transform((val) => val === "true" || val === "1")
      .default(true),
    // Redis configuration
    REDIS_URL: robustUrlSchema.optional().catch(undefined),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),

    // Resend configuration
    RESEND_API_KEY: z.string().default("re_dummy_key_for_testing"),
    EMAIL_FROM: z.string().default("Hyundai Nhat Nang <onboarding@resend.dev>"),

    // JWT configuration
    JWT_SECRET: z
      .string()
      .default("super-secret-jwt-key-minimum-32-chars-long"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    // PayOS configuration
    PAYOS_CLIENT_ID: z.string().default("dummy-client-id"),
    PAYOS_API_KEY: z.string().default("dummy-api-key"),
    PAYOS_CHECKSUM_KEY: z.string().default("dummy-checksum-key"),
    // Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: z.string().optional().catch(undefined),
    CLOUDINARY_API_KEY: z.string().optional().catch(undefined),
    CLOUDINARY_API_SECRET: z.string().optional().catch(undefined),

    // E-commerce business configuration
    VAT_RATE: z.coerce.number().default(0.1),
    DEPOSIT_RATE: z.coerce.number().default(0.2),

    // CORS configuration
    CORS_ORIGINS: z
      .string()
      .default("http://localhost:3000,http://localhost:3001"),

    // Cron & Automation configuration
    CRON_SECRET: z.string().optional().catch(undefined),

    // Telegram Notifications configuration
    TELEGRAM_BOT_TOKEN: z.string().optional().catch(undefined),
    TELEGRAM_ADMIN_CHAT_ID: z.string().optional().catch(undefined),

    // Load Testing configuration
    VUS: z.coerce.number().default(500),
    TARGET_URL: robustUrlSchema.catch("http://127.0.0.1:3000"),

    // Sentry configuration
    SENTRY_DSN: z.string().optional().catch(undefined),
    SENTRY_ENVIRONMENT: z.string().optional().catch(undefined),
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(1.0),
  },
  runtimeEnv: {
    PORT: process.env["PORT"],
    DOMAIN_NAME: process.env["DOMAIN_NAME"],
    FRONTEND_URL: process.env["FRONTEND_URL"],
    ADMIN_URL: process.env["ADMIN_URL"],
    NODE_ENV: process.env["APP_ENV"] ?? process.env.NODE_ENV,
    DB_URL: process.env["DB_URL"],
    DB_HOST: process.env["DB_HOST"],
    DB_PORT: process.env["DB_PORT"],
    DB_USERNAME: process.env["DB_USERNAME"],
    DB_PASSWORD: process.env["DB_PASSWORD"],
    DB_DATABASE: process.env["DB_DATABASE"],
    DB_LOGGING: process.env["DB_LOGGING"],
    REDIS_URL: process.env["REDIS_URL"],
    REDIS_HOST: process.env["REDIS_HOST"],
    REDIS_PORT: process.env["REDIS_PORT"],
    RESEND_API_KEY: process.env["RESEND_API_KEY"],
    EMAIL_FROM: process.env["EMAIL_FROM"],
    JWT_SECRET: process.env["JWT_SECRET"],
    JWT_ACCESS_EXPIRES_IN: process.env["JWT_ACCESS_EXPIRES_IN"],
    JWT_REFRESH_EXPIRES_IN: process.env["JWT_REFRESH_EXPIRES_IN"],
    LOG_LEVEL: process.env["LOG_LEVEL"],
    PAYOS_CLIENT_ID: process.env["PAYOS_CLIENT_ID"],
    PAYOS_API_KEY: process.env["PAYOS_API_KEY"],
    PAYOS_CHECKSUM_KEY: process.env["PAYOS_CHECKSUM_KEY"],
    CLOUDINARY_CLOUD_NAME: process.env["CLOUDINARY_CLOUD_NAME"],
    CLOUDINARY_API_KEY: process.env["CLOUDINARY_API_KEY"],
    CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"],
    VAT_RATE: process.env["VAT_RATE"],
    DEPOSIT_RATE: process.env["DEPOSIT_RATE"],
    CORS_ORIGINS: process.env["CORS_ORIGINS"],
    CRON_SECRET: process.env["CRON_SECRET"],
    TELEGRAM_BOT_TOKEN: process.env["TELEGRAM_BOT_TOKEN"],
    TELEGRAM_ADMIN_CHAT_ID: process.env["TELEGRAM_ADMIN_CHAT_ID"],
    VUS: process.env["VUS"],
    TARGET_URL: process.env["TARGET_URL"],
    SENTRY_DSN: process.env["SENTRY_DSN"],
    SENTRY_ENVIRONMENT: process.env["SENTRY_ENVIRONMENT"],
    SENTRY_TRACES_SAMPLE_RATE: process.env["SENTRY_TRACES_SAMPLE_RATE"],
  },
  emptyStringAsUndefined: true,
  skipValidation:
    !!process.env["SKIP_ENV_VALIDATION"] || process.env.NODE_ENV === "test",

  onValidationError: (issues) => {
    console.error("❌ Invalid environment variables configuration:");
    issues.forEach((issue) => {
      let pathString = "root";
      if (issue.path && Array.isArray(issue.path)) {
        pathString = issue.path.map((segment) => String(segment)).join(".");
      }

      console.error(` - ${pathString}: ${issue.message}`);
    });
    process.exit(1);
  },
});
