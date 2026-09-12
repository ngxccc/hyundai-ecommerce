import { z } from "zod";
import { createZodDto } from "@/common/dto";
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
export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {
  public static readonly zodSchema = forgotPasswordSchema;
}
