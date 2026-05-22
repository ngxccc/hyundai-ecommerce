import type {
  IAuthService,
  LoginOptions,
  RegisterOptions,
  TAuthActionResult,
} from "@nhatnang/types";
import {
  AUTH_ERROR_CODES,
  type TAuthErrorCode,
  type TSystemErrorCode,
} from "@nhatnang/shared/constants";
import { type APIError, auth, isAPIError } from "../auth";
import type { TLoginForm, TRegisterForm } from "../schemas";

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
  async loginEmail(
    data: TLoginForm,
    options?: LoginOptions,
  ): Promise<TAuthActionResult<{ userId: string }>> {
    const { email, password } = data;
    try {
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
          callbackURL: options?.callbackURL ?? "/",
        },
        // Better Auth trả về dữ liệu thô ({ user, session }) thay vì object Response
        asResponse: false,
        ...(options?.headers && { headers: options.headers }),
      });

      return { success: true, data: { userId: result.user.id } };
    } catch (error) {
      console.log("Auth Service Error(signin): ", error);

      if (isAPIError(error)) {
        return {
          success: false,
          code: mapLoginAuthErrorCode(error),
          error: error.message,
        };
      }

      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  }

  async register(
    data: TRegisterForm,
    options?: RegisterOptions,
  ): Promise<TAuthActionResult<{ userId: string }>> {
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

      const result = await auth.api.signUpEmail({
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

      return { success: true, data: { userId: result.user.id } };
    } catch (error) {
      console.log("Auth Service Error(register): ", error);

      if (isAPIError(error)) {
        return {
          success: false,
          error: error.message,
          code: "INVALID_CREDENTIALS",
        };
      }

      return {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
      };
    }
  }
}

export const authService = new AuthService();
