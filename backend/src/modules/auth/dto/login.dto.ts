import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zEmail } from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { USER_ROLES, USER_STATUSES } from "@/database/schemas";

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

export const userInfoSchema = z.object({
  id: z.uuid(),
  email: zEmail(),
  fullName: z.string(),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userInfoSchema,
});

export type LoginDtoType = z.infer<typeof loginSchema>;
export type UserInfoDtoType = z.infer<typeof userInfoSchema>;
export type LoginResponseDtoType = z.infer<typeof loginResponseSchema>;

/**
 * Data Transfer Object for user login request.
 */
export class LoginDto extends createZodDto(loginSchema) {
  public static readonly zodSchema = loginSchema;
}

export class UserInfoDto extends createZodDto(userInfoSchema) {}
export class LoginResponseDto extends createZodDto(loginResponseSchema) {}
