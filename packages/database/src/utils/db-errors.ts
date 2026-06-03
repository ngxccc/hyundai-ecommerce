export const POSTGRES_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
} as const;

export interface PostgresError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

export function handleServiceError(
  error: unknown,
  fallbackMessage: string,
): never {
  if (isUniqueConstraintError(error)) {
    throw new Error("errors.validation.slugExists", { cause: error });
  }

  if (error instanceof Error) {
    if (error.message.startsWith("errors.")) {
      throw error;
    }
    throw new Error(fallbackMessage, { cause: error });
  }

  throw new Error(fallbackMessage);
}

export function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>)["code"] === "string"
  );
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    isPostgresError(error) &&
    error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION
  );
}
