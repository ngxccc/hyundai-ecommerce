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
    example: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    description: "Active 64-character hex refresh token string",
  })
  public refreshToken!: string;
}

export class RefreshResponseDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  public accessToken!: string;

  @ApiProperty({
    example: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  })
  public refreshToken!: string;
}
