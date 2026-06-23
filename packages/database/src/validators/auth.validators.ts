import { z } from "zod";
import { businessTypeEnum } from "../schemas/auth.schema";

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

export const registerSchema = z
  .object({
    name: z.string().min(2, "validation.fullNameMin"),
    email: z.email("validation.emailInvalid"),
    phone: z
      .string()
      .min(10, "validation.phoneInvalid")
      .max(10, "validation.phoneInvalid"),
    password: z.string().min(6, "validation.passwordMin"),
    confirmPassword: z.string().min(1, "validation.confirmPasswordRequired"),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
    businessType: z.enum(businessTypeEnum.enumValues, {
      message: "validation.businessTypeRequired",
    }),
    province: z.string().optional(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "validation.agreeTermsRequired",
    }),
  })
  .strict()
  .superRefine((data, ctx) => {
    const isBusinessCustomer = data.businessType !== "END_USER";

    if (isBusinessCustomer) {
      validateRequiredTextField(
        ctx,
        data.companyName,
        "companyName",
        "validation.companyNameRequired",
        "validation.companyNameMin",
        2,
      );

      validateRequiredTextField(
        ctx,
        data.taxId,
        "taxId",
        "validation.taxIdRequired",
        "validation.taxIdMin",
        8,
      );

      validateRequiredTextField(
        ctx,
        data.province,
        "province",
        "validation.provinceRequired",
        "validation.provinceMin",
        2,
      );
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
      addFieldIssue(
        ctx,
        "confirmPassword",
        "validation.confirmPasswordMismatch",
      );
    }
  });

export const loginSchema = z
  .object({
    email: z.email("validation.emailInvalid"),
    password: z.string().min(1, "validation.passwordRequired"),
  })
  .strip();

export const createEmployeeSchema = z
  .object({
    name: z.string().min(2, "validation.fullNameMin"),
    email: z.email("validation.emailInvalid"),
    phone: z
      .string()
      .min(10, "validation.phoneInvalid")
      .max(10, "validation.phoneInvalid"),
    password: z.string().min(6, "validation.passwordMin"),
    confirmPassword: z.string().min(1, "validation.confirmPasswordRequired"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      addFieldIssue(
        ctx,
        "confirmPassword",
        "validation.confirmPasswordMismatch",
      );
    }
  });

export type TLoginForm = z.infer<typeof loginSchema>;
export type TRegisterForm = z.infer<typeof registerSchema>;
export type TCreateEmployeeForm = z.infer<typeof createEmployeeSchema>;
