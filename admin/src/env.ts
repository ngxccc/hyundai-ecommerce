import { ENVIRONMENT_MODES, MESSAGES } from "@/shared/constants";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum([
        ENVIRONMENT_MODES.DEVELOPMENT,
        ENVIRONMENT_MODES.PRODUCTION,
        ENVIRONMENT_MODES.TEST,
      ])
      .default(ENVIRONMENT_MODES.DEVELOPMENT),
    CLOUDINARY_API_SECRET: z.string().min(1).default("dummy-secret"),
    CLOUDINARY_API_KEY: z.string().min(1).default("dummy-key"),
    BACKEND_API_URL: z.url().default("http://127.0.0.1:3000"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z
      .url(MESSAGES.NEXT_URL_IS_INVALID)
      .default("http://localhost:3002"),
    NEXT_PUBLIC_STOREFRONT_URL: z
      .url(MESSAGES.NEXT_URL_IS_INVALID)
      .default("http://localhost:3001"),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1).default("dummy-cloud"),
  },

  runtimeEnv: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_ADMIN_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : undefined),
    NEXT_PUBLIC_STOREFRONT_URL:
      process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },

  emptyStringAsUndefined: true,
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",

  onValidationError: (issues) => {
    console.error(MESSAGES.DOTENV_FILE_CONFIG_INVALID);
    issues.forEach((issue) => {
      const pathString = issue.path
        ? issue.path
            .map((segment) =>
              typeof segment === "string" || typeof segment === "number"
                ? String(segment)
                : "",
            )
            .join(".")
        : "root";

      console.error(` - ${pathString}: ${issue.message}`);
    });
    process.exit(1);
  },
});
