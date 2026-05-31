"use server";

import {
  AUTH_ERROR_CODES,
  SYSTEM_ERROR_CODES,
} from "@nhatnang/shared/constants";
import { z } from "zod";
import { authService, userService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import {
  createRegisterSchema,
  type TRegisterForm,
} from "@nhatnang/database/validators";

export async function registerAction(data: TRegisterForm) {
  const schema = createRegisterSchema((key: string) => key);
  const parsed = await schema.safeParseAsync(data);

  if (!parsed.success) {
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
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

    let errorMessage = t("registerFailed");
    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      errorMessage = t(key);
    }

    return {
      success: false as const,
      error: errorMessage,
    };
  }
}
