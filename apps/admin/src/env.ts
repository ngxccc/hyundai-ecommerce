import { ENVIRONMENT_MODES, MESSAGES } from "@nhatnang/shared/constants";
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
    CLOUDINARY_API_SECRET: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(MESSAGES.NEXT_URL_IS_INVALID),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  },

  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"],
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"],
    CLOUDINARY_API_KEY: process.env["CLOUDINARY_API_KEY"],
    UPSTASH_REDIS_REST_URL: process.env["UPSTASH_REDIS_REST_URL"],
    UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"],
  },

  emptyStringAsUndefined: true,
  skipValidation:
    !!process.env["SKIP_ENV_VALIDATION"] || process.env.NODE_ENV === "test",

  onValidationError: (issues) => {
    console.error(MESSAGES.DOTENV_FILE_CONFIG_INVALID);
    issues.forEach((issue) => {
      const pathString = issue.path
        ? issue.path
            .map((segment) => {
              const isObject =
                typeof segment === "object" &&
                segment !== null &&
                "key" in segment;

              const rawKey = isObject ? segment.key : segment;

              return String(rawKey);
            })
            .join(".")
        : "root";

      console.error(` - ${pathString}: ${issue.message}`);
    });
    process.exit(1);
  },
});
