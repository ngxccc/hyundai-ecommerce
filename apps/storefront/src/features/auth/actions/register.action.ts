"use server";

import { headers } from "next/headers";
import { getTranslationError } from "@/shared/lib/utils";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";
import { authService, userService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import {
  registerSchema,
  type RegisterForm,
} from "@nhatnang/database/validators";
import { validateSchema } from "@/shared/lib/validation";

export async function registerAction(data: RegisterForm) {
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

  const validation = validateSchema(registerSchema, data);
  if (!validation.success) {
    return validation;
  }

  const validatedData = validation.data;

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
    console.error("[registerAction]", error);
    const errorMessage = await getTranslationError(error, "registerFailed");
    return { success: false as const, error: errorMessage };
  }
}
