import type { UseFormReturn, FieldValues } from "react-hook-form";
import {
  type TAuthErrorCode,
  type TSystemErrorCode,
} from "@nhatnang/shared/constants";
import {
  type TLoginForm,
  type TRegisterForm,
} from "@nhatnang/database/schemas";

export type IAuthErrorMessageMap = Record<string, string>;

export interface IAuthFormSectionProps<
  TForm extends FieldValues = FieldValues,
> {
  form: UseFormReturn<TForm>;
  isLoading?: boolean;
  disabled?: boolean;
}

export type TAuthActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; code: TAuthErrorCode | TSystemErrorCode; error?: string };

export interface LoginOptions {
  headers?: HeadersInit;
  callbackURL?: string;
}

export interface RegisterOptions {
  callbackURL?: string;
}

export interface IAuthService {
  loginEmail(
    data: TLoginForm,
    options?: LoginOptions,
  ): Promise<TAuthActionResult<{ userId: string }>>;
  register(
    data: TRegisterForm,
    options?: RegisterOptions,
  ): Promise<TAuthActionResult<{ userId: string }>>;
  // TODO: thêm socialLogin, magicLink, resetPassword khi cần
}
