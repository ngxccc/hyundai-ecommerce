import { z } from "zod";
import { createZodDto } from "@/common/dto";
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
export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {
  public static readonly zodSchema = verifyEmailSchema;
}
