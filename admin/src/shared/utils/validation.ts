import type { ZodError } from "zod";

export function formatValidationErrors(
  error: ZodError,
  t: (key: string) => string,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!field) return;

    fieldErrors[field] ??= [];

    let message = t("invalidInput");

    if (issue.code === "too_small") {
      if (field === "name") {
        message = t("validation.nameRequired");
      } else if (field === "slug") {
        message = t("validation.slugRequired");
      } else if (field === "price") {
        message = t("validation.priceRequired");
      } else if (field === "streetAddress") {
        message = t("validation.streetAddressRequired");
      } else if (field === "district") {
        message = t("validation.districtRequired");
      } else if (field === "city") {
        message = t("validation.cityRequired");
      } else if (field === "tierName") {
        message = t("validation.tierNameRequired");
      } else if (field === "email") {
        message = t("validation.emailRequired");
      } else if (field === "password") {
        message = t("validation.passwordRequired");
      }
    } else if (
      issue.code === "invalid_format" ||
      issue.code === ("invalid_string" as "invalid_type")
    ) {
      const formatVal =
        (issue as unknown as Record<string, unknown>)["format"] ??
        (issue as unknown as Record<string, unknown>)["validation"];
      if (formatVal === "url") {
        message = t("validation.invalidUrl");
      } else if (formatVal === "uuid") {
        if (field === "brandId") {
          message = t("validation.invalidBrand");
        } else if (field === "categoryId") {
          message = t("validation.invalidCategory");
        } else if (field === "parentId") {
          message = t("validation.invalidParent");
        } else {
          message = t("validation.invalidId");
        }
      } else if (formatVal === "email") {
        message = t("validation.emailInvalid");
      }
    } else if (issue.code === "custom" && issue.message) {
      message = issue.message.startsWith("validation.")
        ? t(issue.message)
        : issue.message;
    }

    fieldErrors[field].push(message);
  });

  return fieldErrors;
}
