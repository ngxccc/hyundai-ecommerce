"use server";

import { revalidatePath } from "next/cache";
import { dealerTierService, userService } from "@nhatnang/database/services";
import {
  getCreateDealerTierSchema,
  type TCreateDealerTierInput,
} from "@nhatnang/database/validators";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { z } from "zod";
import { requireAuth, AuthError } from "@/shared/lib/action-auth";
import { getTranslations } from "next-intl/server";

/**
 * Server action to create a new B2B Dealer Tier
 */
export const createDealerTierAction = async (formData: FormData) => {
  try {
    await requireAuth();

    const payloadStr = formData.get("payload");
    if (!payloadStr) throw new Error("Missing payload");
    const data = JSON.parse(payloadStr as string) as TCreateDealerTierInput;
    const schema = getCreateDealerTierSchema((key) => key);
    const parsed = await schema.safeParseAsync(data);

    if (!parsed.success) {
      return {
        success: false as const,
        code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    const validatedData = parsed.data;
    const tierData = await dealerTierService.create({
      name: validatedData.name,
      discountPercentage: validatedData.discountPercentage,
      minimumSpend: validatedData.minimumSpend,
    });

    revalidatePath("/customers/tiers");
    return { success: true as const, data: tierData };
  } catch (error) {
    const t = await getTranslations("errors");

    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[createDealerTierAction]", error);
    return { success: false as const, error: t("createDealerTierFailed") };
  }
};

/**
 * Server action to update a customer's corporate business parameters (Dealer Tier, Role, Business Type)
 */
export const updateCustomerTierAction = async (
  userId: string,
  payload: {
    dealerTierId: string | null;
    businessType: "dealer" | "contractor" | "end_user" | "distributor";
  }
) => {
  try {
    await requireAuth();

    // Map business role dynamically: promoting to "dealer" role if businessType is dealer
    const role = payload.businessType === "dealer" ? "dealer" : "customer";

    const updatedUser = await userService.update(userId, {
      dealerTierId: payload.dealerTierId,
      businessType: payload.businessType,
      role,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    revalidatePath("/customers");
    return { success: true as const, data: updatedUser };
  } catch (error) {
    const t = await getTranslations("errors");

    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: error.message === "Unauthorized" ? t("unauthorized") : t("forbidden"),
      };
    }

    console.error("[updateCustomerTierAction]", error);
    return { success: false as const, error: t("updateCustomerFailed") };
  }
};
