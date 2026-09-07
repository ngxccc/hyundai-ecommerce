import type { ZodError } from "zod";
import {
  translateZodMessage,
  type I18nTranslator,
} from "@/shared/lib/i18n-zod";

export function formatValidationErrors(
  error: ZodError,
  t: I18nTranslator,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!field) return;

    fieldErrors[field] ??= [];

    let message = issue.message ? translateZodMessage(issue.message, t) : "";

    if (!message || message === "Invalid input") {
      message = t("invalidInput" as never);

      if (issue.code === "too_small") {
        if (field === "name") {
          message = t("validation.nameRequired" as never);
        } else if (field === "slug") {
          message = t("validation.slugRequired" as never);
        } else if (field === "price") {
          message = t("validation.priceRequired" as never);
        } else if (field === "streetAddress") {
          message = t("validation.streetAddressRequired" as never);
        } else if (field === "district") {
          message = t("validation.districtRequired" as never);
        } else if (field === "city") {
          message = t("validation.cityRequired" as never);
        } else if (field === "tierName") {
          message = t("validation.tierNameRequired" as never);
        } else if (field === "email") {
          message = t("validation.emailRequired" as never);
        } else if (field === "password") {
          message = t("validation.passwordRequired" as never);
        }
      } else if (
        issue.code === "invalid_format" ||
        issue.code === ("invalid_string" as "invalid_type")
      ) {
        const formatVal =
          (issue as unknown as Record<string, unknown>).format ??
          (issue as unknown as Record<string, unknown>).validation;
        if (formatVal === "url") {
          message = t("validation.invalidUrl" as never);
        } else if (formatVal === "uuid") {
          if (field === "brandId") {
            message = t("validation.invalidBrand" as never);
          } else if (field === "categoryId") {
            message = t("validation.invalidCategory" as never);
          } else if (field === "parentId") {
            message = t("validation.invalidParent" as never);
          } else {
            message = t("validation.invalidId" as never);
          }
        } else if (formatVal === "email") {
          message = t("validation.emailInvalid" as never);
        }
      }
    }

    fieldErrors[field].push(message);
  });

  return fieldErrors;
}
