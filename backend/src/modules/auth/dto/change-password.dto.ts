import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zPassword } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * Zod validation schema for password change requests.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string(i18nZodMsg("validation.isString"))
      .min(1, { message: i18nZodMsg("validation.isNotEmpty") })
      .max(256, { message: i18nZodMsg("validation.maxLength", { "0": 256 }) }),
    newPassword: zPassword(),
  })
  .strict();

export type ChangePasswordDtoType = z.infer<typeof changePasswordSchema>;

/**
 * Data Transfer Object for changing account password.
 */
export class ChangePasswordDto implements ChangePasswordDtoType {
  public static readonly zodSchema = changePasswordSchema;

  @ApiProperty({
    example: "CurrentPassword123!",
    description: "Current account password",
  })
  public currentPassword!: string;

  @ApiProperty({
    example: "NewSecurePassword456!",
    description: "New account password (must differ from current)",
  })
  public newPassword!: string;
}
