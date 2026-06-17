import { z } from "zod";
import { businessTypeEnum } from "../schemas/auth.schema";

const optionalText = (minLen: number, errKey: string) =>
  z
    .string()
    .refine((v) => v === "" || v.length >= minLen, errKey)
    .optional();

export const updateProfileSchema = z.object({
  name: z.string().min(2, "validation.fullNameMin"),
  phone: z
    .string()
    .min(10, "validation.phoneInvalid")
    .max(10, "validation.phoneInvalid"),
  companyName: optionalText(2, "validation.companyNameMin"),
  taxId: optionalText(10, "validation.taxIdInvalid"),
  businessType: z.enum(businessTypeEnum.enumValues).optional(),
  province: optionalText(2, "validation.provinceRequired"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.currentPasswordRequired"),
    newPassword: z.string().min(6, "validation.passwordMin"),
    confirmPassword: z.string().min(1, "validation.confirmPasswordRequired"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });

export type TUpdateProfileForm = z.infer<typeof updateProfileSchema>;
export type TChangePasswordForm = z.infer<typeof changePasswordSchema>;
