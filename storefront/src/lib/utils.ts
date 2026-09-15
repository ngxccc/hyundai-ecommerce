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

/**
 * Sanitizes human-entered price strings (e.g. "150.000.000", "150,000,000", "150 000 đ")
 * into a clean digits-only numeric string (e.g. "150000000") or null.
 */
export function normalizePriceString(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d]/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Formats a number or numeric string with Vietnamese thousand separators (e.g. 150000000 -> "150.000.000").
 */
export function formatNumberInput(
  value: string | number | undefined | null,
): string {
  if (value === undefined || value === null || value === "") return "";
  const num =
    typeof value === "string" ? parseFloat(value.replace(/[^\d]/g, "")) : value;
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
}

/**
 * Extracts digits only from an input string (e.g. "150.000.000 ₫" -> "150000000").
 */
export function parseNumberInput(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/[^\d]/g, "");
}

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
