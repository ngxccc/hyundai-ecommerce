import type { ZodError, ZodType, infer as zInfer } from "zod";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import type { ActionResult } from "@nhatnang/shared";

export function formatValidationErrors(
  error: ZodError,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!field) return;

    fieldErrors[field] ??= [];

    let message = "validation.invalid";

    if (issue.code === "too_small") {
      if (field === "name") {
        message = "validation.fullNameMin";
      } else if (field === "email") {
        message = "validation.emailRequired";
      } else if (field === "password") {
        message = "validation.passwordRequired";
      }
    } else if (
      issue.code === "invalid_format" ||
      issue.code === ("invalid_string" as "invalid_type")
    ) {
      const formatVal =
        (issue as unknown as Record<string, unknown>)["format"] ??
        (issue as unknown as Record<string, unknown>)["validation"];
      if (formatVal === "email") {
        message = "validation.emailInvalid";
      } else if (formatVal === "uuid") {
        message = "validation.invalidId";
      }
    } else if (issue.code === "custom" && issue.message) {
      message = issue.message;
    }

    fieldErrors[field].push(message);
  });

  return fieldErrors;
}

export function validateSchema<T extends ZodType>(
  schema: T,
  data: unknown,
): ActionResult<zInfer<T>> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: formatValidationErrors(parsed.error),
    };
  }
  return {
    success: true,
    data: parsed.data,
  };
}
