import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getTranslations } from "next-intl/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function isDomainError(
  error: unknown,
): error is { translationKey: string } {
  return (
    typeof error === "object" && error !== null && "translationKey" in error
  );
}

export function formatShippingAddress(
  addressStr: string | null | undefined,
): string {
  if (!addressStr) return "";
  return addressStr;
}

export const getTranslationError = async (
  errorOrKey: unknown,
  fallbackKey = "INTERNAL_SERVER_ERROR",
) => {
  const t = await getTranslations("errors");

  if (typeof errorOrKey === "string") return t(errorOrKey as never);

  if (isDomainError(errorOrKey)) {
    return t(errorOrKey.translationKey as never);
  }

  if (errorOrKey instanceof Error && errorOrKey.message.startsWith("errors.")) {
    const errorKey = errorOrKey.message.replace("errors.", "");
    return t(errorKey as never);
  }
  return t(fallbackKey as never);
};
