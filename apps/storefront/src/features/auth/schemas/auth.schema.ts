import { z } from "zod";
import { businessTypeEnum } from "@nhatnang/database/schemas";

type TRegisterValidationMessageKey =
  | "validation.fullNameMin"
  | "validation.emailInvalid"
  | "validation.phoneMin"
  | "validation.passwordMin"
  | "validation.confirmPasswordRequired"
  | "validation.companyNameRequired"
  | "validation.companyNameMin"
  | "validation.taxIdRequired"
  | "validation.taxIdMin"
  | "validation.businessTypeRequired"
  | "validation.provinceRequired"
  | "validation.provinceMin"
  | "validation.agreeTermsRequired"
  | "validation.confirmPasswordMismatch";

type IRegisterTranslator = (key: TRegisterValidationMessageKey) => string;

const addFieldIssue = (
  ctx: z.RefinementCtx,
  path: "companyName" | "taxId" | "province" | "confirmPassword",
  message: string,
) => {
  ctx.addIssue({
    code: "custom",
    path: [path],
    message,
  });
};

const validateRequiredTextField = (
  ctx: z.RefinementCtx,
  value: string | undefined,
  path: "companyName" | "taxId" | "province",
  requiredMessage: string,
  minMessage: string,
  minLength: number,
) => {
  const normalizedValue = value?.trim() ?? "";

  if (!normalizedValue) {
    addFieldIssue(ctx, path, requiredMessage);
    return;
  }

  if (normalizedValue.length < minLength) {
    addFieldIssue(ctx, path, minMessage);
  }
};

export const createRegisterSchema = (t: IRegisterTranslator) =>
  z
    .object({
      fullName: z.string().min(2, t("validation.fullNameMin")),
      email: z.email(t("validation.emailInvalid")),
      phone: z.string().min(10, t("validation.phoneMin")),
      password: z.string().min(6, t("validation.passwordMin")),
      confirmPassword: z
        .string()
        .min(1, t("validation.confirmPasswordRequired")),
      companyName: z.string().optional(),
      taxId: z.string().optional(),
      businessType: z.enum(businessTypeEnum.enumValues, {
        error: t("validation.businessTypeRequired"),
      }),
      province: z.string().optional(),
      agreeTerms: z.boolean().refine((val) => val === true, {
        error: t("validation.agreeTermsRequired"),
      }),
    })
    .superRefine((data, ctx) => {
      const isBusinessCustomer = data.businessType !== "end_user";

      if (isBusinessCustomer) {
        validateRequiredTextField(
          ctx,
          data.companyName,
          "companyName",
          t("validation.companyNameRequired"),
          t("validation.companyNameMin"),
          2,
        );

        validateRequiredTextField(
          ctx,
          data.taxId,
          "taxId",
          t("validation.taxIdRequired"),
          t("validation.taxIdMin"),
          8,
        );

        validateRequiredTextField(
          ctx,
          data.province,
          "province",
          t("validation.provinceRequired"),
          t("validation.provinceMin"),
          2,
        );
      }

      if (data.confirmPassword && data.password !== data.confirmPassword) {
        addFieldIssue(
          ctx,
          "confirmPassword",
          t("validation.confirmPasswordMismatch"),
        );
      }
    });

export type TRegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>;
