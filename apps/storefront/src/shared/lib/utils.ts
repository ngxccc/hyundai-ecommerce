import { getTranslations } from "next-intl/server";
import { isDomainError } from "@nhatnang/core";

export { cn } from "@nhatnang/ui/lib/utils";
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
