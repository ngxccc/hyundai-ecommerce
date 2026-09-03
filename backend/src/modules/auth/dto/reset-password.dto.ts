import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
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
export class ResetPasswordDto implements ResetPasswordDtoType {
  public static readonly zodSchema = resetPasswordSchema;

  @ApiProperty({
    example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    description: "64-character password reset token received via email",
  })
  public token!: string;

  @ApiProperty({
    example: "NewPassword123!",
    description: "New strong password",
  })
  public password!: string;

  @ApiProperty({
    example: "NewPassword123!",
    description: "Must match new password",
  })
  public confirmPassword!: string;
}
