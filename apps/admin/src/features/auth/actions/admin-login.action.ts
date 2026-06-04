"use server";

import { headers } from "next/headers";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import { authService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { loginSchema, type TLoginForm } from "@nhatnang/database/validators";
import { formatValidationErrors } from "@/shared/utils/validation";

export const adminLoginAction = async (data: TLoginForm) => {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") ?? "127.0.0.1";

  // 1. Rate limiting check
  const rateLimitResult = await checkRateLimitWithQueue(
    `login:admin:${ip}`,
    5,
    "60 s",
  );

  if (!rateLimitResult.success) {
    const t = await getTranslations("errors");
    return {
      success: false as const,
      error: t("rateLimitExceeded"),
    };
  }

  const parsed = await loginSchema.safeParseAsync(data);

  if (!parsed.success) {
    const t = await getTranslations("errors");
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: formatValidationErrors(parsed.error, (key: string) =>
        t(key as never),
      ),
    };
  }

  try {
    const data = await authService.loginEmail(parsed.data, {
      headers: reqHeaders,
    });
    return { success: true as const, data };
  } catch (error) {
    const t = await getTranslations("errors");
    console.error("[adminLoginAction]", error);

    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      return { success: false as const, error: t(key) };
    }

    return { success: false as const, error: t("loginFailed") };
  }
};
