"use server";

import { headers } from "next/headers";
import { getTranslationError } from "@/shared/lib/utils";
import { getCachedSession } from "@/shared/lib/session";
import { auth } from "@nhatnang/database/auth";
import {
  changePasswordSchema,
  type ChangePasswordForm,
} from "@nhatnang/database/validators";
import { validateSchema } from "@/shared/lib/validation";
import { getTranslations } from "next-intl/server";

export const changePasswordAction = async (data: ChangePasswordForm) => {
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
    const errorMessage = await getTranslationError(
      error,
      "passwordChangeFailed",
    );
    return { success: false, error: errorMessage };
  }
};
