"use server";

import { headers } from "next/headers";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import { authService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { loginSchema, type TLoginForm } from "@nhatnang/database/validators";
import { validateSchema } from "@/shared/lib/validation";

export const loginAction = async (data: TLoginForm) => {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") ?? "127.0.0.1";

  // 1. Rate limiting check
  const rateLimitResult = await checkRateLimitWithQueue(
    `login:storefront:${ip}`,
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

  const validation = validateSchema(loginSchema, data);
  if (!validation.success) {
    return validation;
  }

  try {
    const data = await authService.loginEmail(validation.data, {
      headers: reqHeaders,
    });
    return { success: true as const, data };
  } catch (error) {
    const t = await getTranslations("errors");
    console.error("[loginAction]", error);

    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      return { success: false as const, error: t(key) };
    }

    return { success: false as const, error: t("loginFailed") };
  }
};
