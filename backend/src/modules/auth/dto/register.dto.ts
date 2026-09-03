import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import {
  zEmail,
  zPassword,
  zPhoneNumber,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * Validation schema for user registration requests.
 */
export const registerSchema = z
  .object({
    email: zEmail(),
    fullName: zSanitizedString({ min: 1, max: 100 }),
    phoneNumber: zPhoneNumber(),
    password: zPassword(),
    confirmPassword: z.string(i18nZodMsg("validation.isString")).min(8),
    agreeTerms: z.literal(true, {
      error: i18nZodMsg("validation.mustAcceptTerms"),
    }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: i18nZodMsg("validation.passwordsMustMatch"),
    path: ["confirmPassword"],
  });

export type RegisterDtoType = z.infer<typeof registerSchema>;

/**
 * Data Transfer Object for user registration endpoint.
 */
export class RegisterDto implements RegisterDtoType {
  public static readonly zodSchema = registerSchema;

  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  public email!: string;

  @ApiProperty({ example: "John Doe", description: "User full name" })
  public fullName!: string;

  @ApiProperty({
    example: "0912345678",
    description: "Valid 10-digit Vietnamese phone number",
  })
  public phoneNumber!: string;

  @ApiProperty({
    example: "Password123!",
    description: "Strong password with letters, numbers, and symbols",
  })
  public password!: string;

  @ApiProperty({
    example: "Password123!",
    description: "Must match password exactly",
  })
  public confirmPassword!: string;

  @ApiProperty({ example: true, description: "Must accept terms of service" })
  public agreeTerms!: true;
}
