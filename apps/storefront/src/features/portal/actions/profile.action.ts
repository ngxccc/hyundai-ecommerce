"use server";

import { getCachedSession } from "@/shared/lib/session";
import { userService } from "@nhatnang/database/services";
import {
  updateProfileSchema,
  type TUpdateProfileForm,
} from "@nhatnang/database/validators";
import { validateSchema } from "@/shared/lib/validation";
import { getTranslations } from "next-intl/server";

export const updateProfileAction = async (data: TUpdateProfileForm) => {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }

  const validation = validateSchema(updateProfileSchema, data);
  if (!validation.success) {
    return validation;
  }

  try {
    const isDealer =
      session.user.role === "DEALER_APPROVER" ||
      session.user.role === "DEALER_PURCHASER";

    const updateData: Record<string, unknown> = {
      name: validation.data.name,
      phone: validation.data.phone,
    };

    if (!isDealer) {
      if (validation.data.companyName !== undefined) {
        updateData["companyName"] = validation.data.companyName || null;
      }
      if (validation.data.taxId !== undefined) {
        updateData["taxId"] = validation.data.taxId || null;
      }
      if (validation.data.businessType !== undefined) {
        updateData["businessType"] = validation.data.businessType;
      }
      if (validation.data.province !== undefined) {
        updateData["province"] = validation.data.province || null;
      }
    }

    await userService.update(session.user.id, updateData);

    return { success: true };
  } catch (error) {
    console.error("[updateProfileAction]", error);
    return { success: false, error: t("updateFailed") };
  }
};
