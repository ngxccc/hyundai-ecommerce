import type {
  IAuthService,
  LoginOptions,
  RegisterOptions,
  TAuthActionResult,
} from "@nhatnang/types";
import { auth, isAPIError } from "../auth";
import type { TLoginForm, TRegisterForm } from "../schemas";

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
