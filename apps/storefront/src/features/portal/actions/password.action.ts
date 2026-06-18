"use server";

import { headers } from "next/headers";
import { getCachedSession } from "@/shared/lib/session";
import { auth } from "@nhatnang/database/auth";
import {
  changePasswordSchema,
  type TChangePasswordForm,
} from "@nhatnang/database/validators";
import { validateSchema } from "@/shared/lib/validation";
import { getTranslations } from "next-intl/server";

export const changePasswordAction = async (data: TChangePasswordForm) => {
  const reqHeaders = await headers();
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }

  const validation = validateSchema(changePasswordSchema, data);
  if (!validation.success) {
    return validation;
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: validation.data.currentPassword,
        newPassword: validation.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: reqHeaders,
    });
    return { success: true };
  } catch (error) {
    console.error("[changePasswordAction]", error);

    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      return { success: false, error: t(key as never) };
    }

    return { success: false, error: t("passwordChangeFailed") };
  }
};
