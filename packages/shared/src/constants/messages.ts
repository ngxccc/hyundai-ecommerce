export const MESSAGES = {
  DB_URL_IS_INVALID: "DATABASE_URL is missing or malformed.",
  DOTENV_FILE_NOT_FOUND:
    "Environment file (.env) was not found in the root directory.",
  DOTENV_FILE_CONFIG_INVALID: "Invalid declarations detected in the .env file:",
  DOTENV_CONFIG_ERROR:
    "Failed to initialize environment variable configuration.",
  BETTER_AUTH_SECRET_IS_INVALID:
    "BETTER_AUTH_SECRET must be exactly 32 characters long.",
  BETTER_AUTH_URL_IS_INVALID: "BETTER_AUTH_URL must be a valid URL format.",
} as const;

export type TMessage = keyof typeof MESSAGES;
