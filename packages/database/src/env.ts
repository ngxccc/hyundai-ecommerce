import { ENVIRONMENT_MODES, MESSAGES } from "@nhatnang/shared/constants";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(MESSAGES.DB_URL_IS_INVALID),
    NODE_ENV: z
      .enum([
        ENVIRONMENT_MODES.DEVELOPMENT,
        ENVIRONMENT_MODES.PRODUCTION,
        ENVIRONMENT_MODES.TEST,
      ])
      .default(ENVIRONMENT_MODES.DEVELOPMENT),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, MESSAGES.BETTER_AUTH_SECRET_IS_INVALID),
    BETTER_AUTH_URL: z.url(MESSAGES.BETTER_AUTH_URL_IS_INVALID),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z
      .string()
      .regex(
        /^[^<]+<[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}>$/,
        MESSAGES.EMAIL_FROM_IS_INVALID,
      ),
  },

  runtimeEnv: {
    DATABASE_URL: process.env["DATABASE_URL"],
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env["BETTER_AUTH_SECRET"],
    BETTER_AUTH_URL: process.env["BETTER_AUTH_URL"],
    RESEND_API_KEY: process.env["RESEND_API_KEY"],
    EMAIL_FROM: process.env["EMAIL_FROM"],
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
