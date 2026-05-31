"use server";

import { headers } from "next/headers";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { z } from "zod";
import { authService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import {
  createLoginSchema,
  type TLoginForm,
} from "@nhatnang/database/validators";

export const adminLoginAction = async (data: TLoginForm) => {
  const schema = createLoginSchema((key) => key);
  const parsed = await schema.safeParseAsync(data);

  if (!parsed.success) {
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const data = await authService.loginEmail(parsed.data, {
      headers: await headers(),
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
