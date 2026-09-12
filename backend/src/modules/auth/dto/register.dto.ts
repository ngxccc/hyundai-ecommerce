import { z } from "zod";
import { createZodDto } from "@/common/dto";
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
export class RegisterDto extends createZodDto(registerSchema) {
  public static readonly zodSchema = registerSchema;
}
