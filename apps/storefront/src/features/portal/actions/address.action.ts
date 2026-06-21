"use server";

import { getCachedSession } from "@/shared/lib/session";
import { addressService } from "@nhatnang/database/services";
import { addressSchema, type TAddressForm } from "@nhatnang/database/validators";
import { validateSchema } from "@/shared/lib/validation";
import { getTranslations } from "next-intl/server";
import { revalidateTag } from "next/cache";

export const addAddressAction = async (data: TAddressForm) => {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }

  const validation = validateSchema(addressSchema, data);
  if (!validation.success) {
    return validation;
  }

  try {
    await addressService.create({
      userId: session.user.id,
      receiverName: validation.data.receiverName,
      phoneNumber: validation.data.phoneNumber,
      streetAddress: validation.data.streetAddress,
      district: validation.data.district,
      city: validation.data.city,
      isDefault: validation.data.isDefault,
    });
    revalidateTag(`user-addresses-${session.user.id}`, "default");
    return { success: true };
  } catch (error) {
    console.error("[addAddressAction]", error);
    return { success: false, error: t("createAddressFailed") };
  }
};

export const updateAddressAction = async (id: string, data: TAddressForm) => {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }

  const validation = validateSchema(addressSchema, data);
  if (!validation.success) {
    return validation;
  }

  try {
    await addressService.update(id, session.user.id, {
      receiverName: validation.data.receiverName,
      phoneNumber: validation.data.phoneNumber,
      streetAddress: validation.data.streetAddress,
      district: validation.data.district,
      city: validation.data.city,
      isDefault: validation.data.isDefault,
    });
    revalidateTag(`user-addresses-${session.user.id}`, "default");
    return { success: true };
  } catch (error) {
    console.error("[updateAddressAction]", error);
    return { success: false, error: t("updateAddressFailed") };
  }
};

export const deleteAddressAction = async (id: string) => {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }

  try {
    await addressService.delete(id, session.user.id);
    revalidateTag(`user-addresses-${session.user.id}`, "default");
    return { success: true };
  } catch (error) {
    console.error("[deleteAddressAction]", error);
    return { success: false, error: t("deleteAddressFailed") };
  }
};

export const setDefaultAddressAction = async (id: string) => {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false, error: t("unauthorized") };
  }

  try {
    await addressService.setDefault(id, session.user.id);
    revalidateTag(`user-addresses-${session.user.id}`, "default");
    return { success: true };
  } catch (error) {
    console.error("[setDefaultAddressAction]", error);
    return { success: false, error: t("updateAddressFailed") };
  }
};
