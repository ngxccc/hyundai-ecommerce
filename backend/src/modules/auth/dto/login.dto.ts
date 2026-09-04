import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";
import { zEmail } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import {
  USER_ROLES,
  USER_STATUSES,
  type UserRole,
  type UserStatus,
} from "@/database/schemas";

/**
 * Zod validation schema for user login authentication requests.
 */
export const loginSchema = z
  .object({
    email: zEmail(),
    password: z
      .string(i18nZodMsg("validation.isString"))
      .min(8, { message: i18nZodMsg("validation.minLength", { "0": 8 }) }),
  })
  .strict();

export type LoginDtoType = z.infer<typeof loginSchema>;

/**
 * Data Transfer Object for user login request.
 */
export class LoginDto implements LoginDtoType {
  public static readonly zodSchema = loginSchema;

  @ApiProperty({
    example: "user@example.com",
    description: "Registered user email address",
  })
  public email!: string;

  @ApiProperty({ example: "Password123!", description: "Account password" })
  public password!: string;
}

export class UserInfoDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "user@example.com" })
  public email!: string;

  @ApiProperty({ example: "John Doe" })
  public fullName!: string;

  @ApiProperty({
    example: "CUSTOMER",
    enum: USER_ROLES,
  })
  public role!: UserRole;

  @ApiProperty({
    example: "ACTIVE",
    enum: USER_STATUSES,
  })
  public status!: UserStatus;
}
export class LoginResponseDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  public accessToken!: string;

  @ApiProperty({ example: "d9b2e8a1-3c5f-4a7b-8e9d-1f2a3b4c5d6e" })
  public refreshToken!: string;

  @ApiProperty({ type: UserInfoDto })
  public user!: UserInfoDto;
}
