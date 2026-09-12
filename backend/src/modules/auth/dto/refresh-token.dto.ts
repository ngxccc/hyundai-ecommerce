import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * Zod validation schema for token refresh requests.
 */
export const refreshTokenSchema = z
  .object({
    refreshToken: z
      .string(i18nZodMsg("validation.isString"))
      .min(1, { message: i18nZodMsg("validation.isNotEmpty") }),
  })
  .strict();

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RefreshTokenDtoType = z.infer<typeof refreshTokenSchema>;
export type RefreshResponseDtoType = z.infer<typeof refreshResponseSchema>;

/**
 * Data Transfer Object for refreshing JWT authentication tokens.
 */
export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {
  public static readonly zodSchema = refreshTokenSchema;
}

export class RefreshResponseDto extends createZodDto(refreshResponseSchema) {}
