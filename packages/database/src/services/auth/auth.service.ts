import type { IDatabase } from "../../client";
import type { AuthService, LoginOptions, RegisterOptions } from "../interfaces";
import {
  AUTH_ERROR_CODES,
  type TAuthErrorCode,
  type TSystemErrorCode,
} from "@nhatnang/shared/constants";
import { type APIError, auth, isAPIError } from "../../auth";
import { eq } from "drizzle-orm";
import { users } from "../../schemas/auth.schema";
import type {
  TLoginForm,
  TRegisterForm,
  TCreateEmployeeForm,
} from "../../validators/auth.validators";

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

export class DbAuthService implements AuthService<TLoginForm, TRegisterForm> {
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
        throw new Error(`errors.${mapLoginAuthErrorCode(error)}`, {
          cause: error,
        });
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

      const role = businessType === "END_USER" ? "CUSTOMER" : "DEALER_APPROVER";

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
          role,
          callbackURL: options?.callbackURL ?? "/login",
        },
        asResponse: false,
      });

      return { userId: result.user.id };
    } catch (error) {
      console.error("Auth Service Error(register): ", error);

      if (isAPIError(error)) {
        throw new Error(`errors.${mapLoginAuthErrorCode(error)}`, {
          cause: error,
        });
      }

      throw new Error("errors.INTERNAL_SERVER_ERROR", { cause: error });
    }
  }

  async createEmployee(
    data: TCreateEmployeeForm,
    ownerId: string,
  ): Promise<{ userId: string }> {
    try {
      const { email, password, name, phone } = data;

      // 1. Fetch owner B2B info
      const [owner] = await this.db
        .select({
          companyName: users.companyName,
          taxId: users.taxId,
          businessType: users.businessType,
          province: users.province,
          dealerTierId: users.dealerTierId,
        })
        .from(users)
        .where(eq(users.id, ownerId))
        .limit(1);

      if (!owner) {
        throw new Error("errors.ownerNotFound");
      }

      // 2. Sign up the employee
      const result = await this.betterAuth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          phone,
          companyName: owner.companyName,
          taxId: owner.taxId,
          businessType: owner.businessType,
          province: owner.province,
          role: "DEALER_PURCHASER",
          parentId: ownerId,
          dealerTierId: owner.dealerTierId,
          callbackURL: "/login",
        },
        asResponse: false,
      });

      return { userId: result.user.id };
    } catch (error) {
      console.error("Auth Service Error(createEmployee): ", error);
      if (isAPIError(error)) {
        throw new Error(`errors.${mapLoginAuthErrorCode(error)}`, {
          cause: error,
        });
      }
      throw new Error("errors.INTERNAL_SERVER_ERROR", { cause: error });
    }
  }
}
