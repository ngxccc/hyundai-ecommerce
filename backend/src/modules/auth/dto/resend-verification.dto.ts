import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
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
export class ResendVerificationDto implements ResendVerificationDtoType {
  public static readonly zodSchema = resendVerificationSchema;

  @ApiProperty({
    example: "user@example.com",
    description: "Email address awaiting verification",
  })
  public email!: string;
}
