"use server";

import { headers } from "next/headers";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import {
  AUTH_ERROR_CODES,
  SYSTEM_ERROR_CODES,
} from "@nhatnang/shared/constants";
import { authService, userService } from "@/shared/services";
import { getTranslations } from "next-intl/server";
import {
  registerSchema,
  type TRegisterForm,
} from "@nhatnang/database/validators";
import { formatValidationErrors } from "@/shared/utils/validation";

export async function registerAction(data: TRegisterForm) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") ?? "127.0.0.1";
  // 1. Rate limiting check
  const rateLimitResult = await checkRateLimitWithQueue(
    `register:storefront:${ip}`,
    3,
    "60 s",
  );

  if (!rateLimitResult.success) {
    const t = await getTranslations("errors");
    return {
      success: false as const,
      error: t("rateLimitExceeded"),
    };
  }

  const parsed = await registerSchema.safeParseAsync(data);

  if (!parsed.success) {
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: formatValidationErrors(parsed.error),
    };
  }

  const validatedData = parsed.data;

  const duplicateRecord = await userService.checkDuplicateUser(
    validatedData.email,
    validatedData.phone,
  );

  if (duplicateRecord) {
    const fieldErrors: Record<string, string[]> = {};

    if (duplicateRecord.email === validatedData.email) {
      fieldErrors["email"] = [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS];
    }
    if (duplicateRecord.phone === validatedData.phone) {
      fieldErrors["phone"] = [AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS];
    }

    return {
      success: false,
      code: "VALIDATION_ERROR" as const,
      fieldErrors,
    };
  }

  try {
    const responseData = await authService.register(validatedData);
    return { success: true as const, data: responseData };
  } catch (error) {
    const t = await getTranslations("errors");
    console.error("[registerAction]", error);

    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      return { success: false as const, error: t(key) };
    }

    return { success: false as const, error: t("registerFailed") };
  }
}
