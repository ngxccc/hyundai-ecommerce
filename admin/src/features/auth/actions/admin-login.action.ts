"use server";

import { cookies, headers } from "next/headers";
import { checkRateLimitWithQueue } from "@/lib/rate-limiter";
import { ApiClientError } from "@/lib/api-client";
import { authApi } from "@/features/auth/api/auth.api";
import { getTranslations } from "next-intl/server";
import { adminLoginSchema, type AdminLoginForm } from "@/validators";
import { formatValidationErrors } from "@/lib/validation";
import { getActionErrorMessage } from "@/lib/action-auth";
import { SYSTEM_ERROR_CODES, REDIS_KEYS } from "@/constants";
import { parseDurationToSeconds } from "@/lib/date.util";

export const adminLoginAction = async (input: AdminLoginForm) => {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") ?? "127.0.0.1";

  const rateLimitResult = await checkRateLimitWithQueue(
    REDIS_KEYS.RATE_LIMIT.ADMIN_LOGIN(ip),
    5,
    "60 s",
  );

  if (!rateLimitResult.success) {
    const t = await getTranslations("errors");
    return {
      success: false as const,
      error: t("rateLimitExceeded"),
      errorCode: SYSTEM_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    };
  }

  const parsed = await adminLoginSchema.safeParseAsync(input);

  if (!parsed.success) {
    const t = await getTranslations("errors");
    return {
      success: false as const,
      fieldErrors: formatValidationErrors(parsed.error, (key: string) =>
        t(key as never),
      ),
    };
  }
  try {
    const { email, password, rememberMe } = parsed.data;
    const { data: res, error } = await authApi.login({ email, password });

    if (error || !res.data) {
      const t = await getTranslations("errors");
      if (
        error &&
        "invalidParams" in error &&
        Array.isArray(error.invalidParams) &&
        error.invalidParams.length > 0
      ) {
        const fieldErrors: Record<string, string[]> = {};
        for (const param of error.invalidParams as {
          name: string;
          reason: string;
        }[]) {
          if (param.name) {
            fieldErrors[param.name] = [param.reason];
          }
        }
        return {
          success: false as const,
          fieldErrors,
        };
      }

      return {
        success: false as const,
        error: error?.detail ?? t("loginFailed"),
      };
    }

    const loginData = res.data;
    const cookieStore = await cookies();
    const sessionMaxAge = rememberMe
      ? parseDurationToSeconds("30d")
      : parseDurationToSeconds("24h");
    const refreshMaxAge = parseDurationToSeconds("30d");

    cookieStore.set("adminAccessToken", loginData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge,
    });

    cookieStore.set("adminRefreshToken", loginData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: refreshMaxAge,
    });

    cookieStore.set(
      "adminUser",
      encodeURIComponent(
        JSON.stringify({
          id: loginData.user.id,
          email: loginData.user.email,
          fullName: loginData.user.fullName,
          role: loginData.user.role,
        }),
      ),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: sessionMaxAge,
      },
    );

    return { success: true as const, data: loginData };
  } catch (error) {
    const t = await getTranslations("errors");
    console.error("[adminLoginAction]", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }

    return {
      success: false as const,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "loginFailed",
      ),
    };
  }
};
