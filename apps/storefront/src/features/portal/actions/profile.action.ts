"use server";
import { revalidateTag } from "next/cache";

import { getCachedSession } from "@/shared/lib/session";
import { userService } from "@nhatnang/database/services";
import {
  updateProfileSchema,
  type TUpdateProfileForm,
} from "@nhatnang/database/validators";
import { formatValidationErrors } from "@/shared/lib/validation";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { getTranslations } from "next-intl/server";

export const updateProfileAction = async (data: TUpdateProfileForm) => {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: formatValidationErrors(parsed.error),
    };
  }

  try {
    const isDealer =
      session.user.role === "DEALER_APPROVER" ||
      session.user.role === "DEALER_PURCHASER";

    const updateData: Record<string, unknown> = {
      name: parsed.data.name,
      phone: parsed.data.phone,
    };

    if (!isDealer) {
      if (parsed.data.companyName !== undefined) {
        updateData["companyName"] = parsed.data.companyName || null;
      }
      if (parsed.data.taxId !== undefined) {
        updateData["taxId"] = parsed.data.taxId || null;
      }
      if (parsed.data.businessType !== undefined) {
        updateData["businessType"] = parsed.data.businessType;
      }
      if (parsed.data.province !== undefined) {
        updateData["province"] = parsed.data.province || null;
      }
    }

    await userService.update(session.user.id, updateData);

    revalidateTag(`user-${session.user.id}`, "default");
    return { success: true };
  } catch (error) {
    console.error("[updateProfileAction]", error);
    return { success: false, error: t("updateFailed") };
  }
};
