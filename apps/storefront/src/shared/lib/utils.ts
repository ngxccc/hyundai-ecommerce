import { clsx, type ClassValue } from "clsx";
import { getTranslations } from "next-intl/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export const getTranslationError = async (
  errorOrKey: unknown,
  fallbackKey = "INTERNAL_SERVER_ERROR",
) => {
  const t = await getTranslations("errors");

  if (typeof errorOrKey === "string") return t(errorOrKey as never);

  if (errorOrKey instanceof Error && errorOrKey.message.startsWith("errors.")) {
    const errorKey = errorOrKey.message.replace("errors.", "");
    return t(errorKey as never);
  }
  return t(fallbackKey as never);
};
