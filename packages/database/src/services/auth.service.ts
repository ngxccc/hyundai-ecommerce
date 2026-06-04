import type { IDatabase } from "../client";
import type {
  IAuthService,
  LoginOptions,
  RegisterOptions,
} from "./interfaces";

import {
  AUTH_ERROR_CODES,
  type TAuthErrorCode,
  type TSystemErrorCode,
} from "@nhatnang/shared/constants";
import { type APIError, auth, isAPIError } from "../auth";
import type { TLoginForm, TRegisterForm } from "../validators/auth.validators";

const mapLoginAuthErrorCode = (
  error: APIError,
): TAuthErrorCode | TSystemErrorCode => {
  const errorCode = error.body?.code;

  if (errorCode === AUTH_ERROR_CODES.ACCOUNT_LOCKED) {
    return "ACCOUNT_LOCKED";
  }

  if (errorCode === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED) {
    return "EMAIL_NOT_VERIFIED";
  }

  return "INVALID_CREDENTIALS";
};

export class AuthService implements IAuthService<TLoginForm, TRegisterForm> {
  constructor(
    protected readonly db: IDatabase,
    protected readonly betterAuth = auth,
  ) {}

  async loginEmail(
    data: TLoginForm,
    options?: LoginOptions,
  ): Promise<{ userId: string }> {
    const { email, password } = data;
    try {
      const result = await this.betterAuth.api.signInEmail({
        body: {
          email,
          password,
          callbackURL: options?.callbackURL ?? "/",
        },
        // Better Auth trả về dữ liệu thô ({ user, session }) thay vì object Response
        asResponse: false,
        ...(options?.headers && { headers: options.headers }),
      });

      return { userId: result.user.id };
    } catch (error) {
      console.error("Auth Service Error(signin): ", error);

      if (isAPIError(error)) {
        throw new Error(`errors.${mapLoginAuthErrorCode(error)}`, { cause: error });
      }

      throw new Error("errors.INTERNAL_SERVER_ERROR", { cause: error });
    }
  }

  async register(
    data: TRegisterForm,
    options?: RegisterOptions,
  ): Promise<{ userId: string }> {
    try {
      const {
        email,
        password,
        name,
        phone,
        companyName,
        taxId,
        businessType,
        province,
      } = data;

      const result = await this.betterAuth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          phone,
          companyName,
          taxId,
          businessType,
          province,
          callbackURL: options?.callbackURL ?? "/login",
        },
        asResponse: false,
      });

      return { userId: result.user.id };
    } catch (error) {
      console.error("Auth Service Error(register): ", error);

      if (isAPIError(error)) {
        throw new Error(`errors.${mapLoginAuthErrorCode(error)}`, { cause: error });
      }

      throw new Error("errors.INTERNAL_SERVER_ERROR", { cause: error });
    }
  }
}

