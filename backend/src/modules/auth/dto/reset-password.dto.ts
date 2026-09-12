import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zPassword } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * Validation schema for password reset verification requests.
 */
export const resetPasswordSchema = z
  .object({
    token: z
      .string(i18nZodMsg("validation.isString"))
      .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
    password: zPassword(),
    confirmPassword: z
      .string(i18nZodMsg("validation.isString"))
      .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: i18nZodMsg("validation.passwordsMustMatch"),
    path: ["confirmPassword"],
  });

export type ResetPasswordDtoType = z.infer<typeof resetPasswordSchema>;

/**
 * Data Transfer Object for resetting forgotten account password.
 */
export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {
  public static readonly zodSchema = resetPasswordSchema;
}
