import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * Validation schema for email verification requests.
 */
export const verifyEmailSchema = z
  .object({
    token: z
      .string(i18nZodMsg("validation.isString"))
      .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
  })
  .strict();

export type VerifyEmailDtoType = z.infer<typeof verifyEmailSchema>;

/**
 * Data Transfer Object for verifying registered user email.
 */
export class VerifyEmailDto implements VerifyEmailDtoType {
  public static readonly zodSchema = verifyEmailSchema;

  @ApiProperty({
    example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    description: "64-character hexadecimal email verification token",
  })
  public token!: string;
}
