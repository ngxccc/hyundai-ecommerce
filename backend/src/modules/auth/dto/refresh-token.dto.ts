import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
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

export type RefreshTokenDtoType = z.infer<typeof refreshTokenSchema>;

/**
 * Data Transfer Object for refreshing JWT authentication tokens.
 */
export class RefreshTokenDto implements RefreshTokenDtoType {
  public static readonly zodSchema = refreshTokenSchema;

  @ApiProperty({
    example: "d9b2e8a1-3c5f-4a7b-8e9d-1f2a3b4c5d6e",
    description: "Active refresh token string",
  })
  public refreshToken!: string;
}

export class RefreshResponseDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  public accessToken!: string;

  @ApiProperty({ example: "d9b2e8a1-3c5f-4a7b-8e9d-1f2a3b4c5d6e" })
  public refreshToken!: string;
}
