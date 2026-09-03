export interface DatabaseErrorDetails {
  isDatabaseError: boolean;
  code?: string;
  message?: string;
  detail?: string;
  table?: string;
  column?: string;
  constraint?: string;
  schema?: string;
  query?: string;
  params?: unknown[];
}

/**
 * Extracts structured diagnostic metadata from PostgreSQL and Drizzle ORM query errors.
 */
export function extractDatabaseErrorDetails(
  error: unknown,
): DatabaseErrorDetails {
  if (typeof error !== "object" || error === null) {
    return { isDatabaseError: false };
  }

  const errObj = error as Record<string, unknown>;
  const cause = (
    errObj["cause"] && typeof errObj["cause"] === "object"
      ? errObj["cause"]
      : {}
  ) as Record<string, unknown>;

  const code =
    (typeof errObj["code"] === "string" ? errObj["code"] : undefined) ??
    (typeof cause["code"] === "string" ? cause["code"] : undefined);

  const detail =
    (typeof errObj["detail"] === "string" ? errObj["detail"] : undefined) ??
    (typeof cause["detail"] === "string" ? cause["detail"] : undefined);

  const table =
    (typeof errObj["table"] === "string" ? errObj["table"] : undefined) ??
    (typeof cause["table"] === "string" ? cause["table"] : undefined);

  const column =
    (typeof errObj["column"] === "string" ? errObj["column"] : undefined) ??
    (typeof cause["column"] === "string" ? cause["column"] : undefined);

  const constraint =
    (typeof errObj["constraint"] === "string"
      ? errObj["constraint"]
      : undefined) ??
    (typeof cause["constraint"] === "string" ? cause["constraint"] : undefined);

  const schema =
    (typeof errObj["schema"] === "string" ? errObj["schema"] : undefined) ??
    (typeof cause["schema"] === "string" ? cause["schema"] : undefined);

  const query =
    (typeof errObj["query"] === "string" ? errObj["query"] : undefined) ??
    (typeof cause["query"] === "string" ? cause["query"] : undefined);

  const params = Array.isArray(errObj["params"]) ? errObj["params"] : undefined;

  const causeMessage =
    typeof cause["message"] === "string" ? cause["message"] : undefined;
  const directMessage =
    typeof errObj["message"] === "string" ? errObj["message"] : undefined;
  const message = causeMessage ?? directMessage;

  const isDrizzleError =
    errObj["name"] === "DrizzleQueryError" ||
    (typeof errObj.constructor === "function" &&
      errObj.constructor.name === "DrizzleQueryError");

  const isPgDriverError =
    cause["name"] === "DatabaseError" ||
    (typeof cause.constructor === "function" &&
      cause.constructor.name === "DatabaseError");

  const isDatabaseError =
    code !== undefined ||
    table !== undefined ||
    constraint !== undefined ||
    query !== undefined ||
    isDrizzleError ||
    isPgDriverError;
  return {
    isDatabaseError,
    code,
    message,
    detail,
    table,
    column,
    constraint,
    schema,
    query,
    params,
  };
}

/**
 * Checks whether an error or its underlying cause matches a specific PostgreSQL error code.
 */
export function isPostgresErrorCode(
  error: unknown,
  targetCode: string,
): boolean {
  const details = extractDatabaseErrorDetails(error);
  return details.code === targetCode;
}
