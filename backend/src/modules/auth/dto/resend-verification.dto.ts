import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zEmail } from "@/common/schemas/zod-primitives";

/**
 * Validation schema for resending email verification link.
 */
export const resendVerificationSchema = z
  .object({
    email: zEmail(),
  })
  .strict();

export type ResendVerificationDtoType = z.infer<
  typeof resendVerificationSchema
>;

/**
 * Data Transfer Object for resending verification email.
 */
export class ResendVerificationDto extends createZodDto(
  resendVerificationSchema,
) {
  public static readonly zodSchema = resendVerificationSchema;
}
