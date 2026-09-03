import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zEmail } from "@/common/schemas/zod-primitives";

/**
 * Zod validation schema for requesting a password reset email.
 */
export const forgotPasswordSchema = z
  .object({
    email: zEmail(),
  })
  .strict();

export type ForgotPasswordDtoType = z.infer<typeof forgotPasswordSchema>;

/**
 * Data Transfer Object for forgot password request.
 */
export class ForgotPasswordDto implements ForgotPasswordDtoType {
  public static readonly zodSchema = forgotPasswordSchema;

  @ApiProperty({
    example: "user@example.com",
    description: "Email address associated with account",
  })
  public email!: string;
}
