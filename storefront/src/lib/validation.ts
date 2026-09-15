import type { ZodError, ZodType, infer as zInfer } from "zod";
import { translateZodMessage, type I18nTranslator } from "./i18n-zod";

export const SYSTEM_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      code?: string;
      error?: string;
      fieldErrors?: Record<string, string[]>;
    };

export function formatValidationErrors(
  error: ZodError,
  t?: I18nTranslator,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!field) return;

    fieldErrors[field] ??= [];

    let rawMessage = issue.message || "validation.invalid";

    if (!issue.message || issue.message === "Invalid input") {
      if (issue.code === "too_small") {
        if (field === "name") {
          rawMessage = "validation.fullNameMin";
        } else if (field === "email") {
          rawMessage = "validation.emailRequired";
        } else if (field === "password") {
          rawMessage = "validation.passwordRequired";
        }
      }
    }

    const message = t ? translateZodMessage(rawMessage, t) : rawMessage;
    fieldErrors[field].push(message);
  });

  return fieldErrors;
}

export function validateSchema<T extends ZodType>(
  schema: T,
  data: unknown,
  t?: I18nTranslator,
): ActionResult<zInfer<T>> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: formatValidationErrors(parsed.error, t),
    };
  }
  return {
    success: true,
    data: parsed.data,
  };
}
