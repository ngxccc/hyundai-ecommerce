import type { TCreateEmployeeForm } from "../../validators";

export interface LoginOptions {
  headers?: HeadersInit;
  callbackURL?: string;
}

export interface RegisterOptions {
  callbackURL?: string;
}

export interface AuthService<TLoginForm = unknown, TRegisterForm = unknown> {
  loginEmail(
    data: TLoginForm,
    options?: LoginOptions,
  ): Promise<{ userId: string }>;
  register(
    data: TRegisterForm,
    options?: RegisterOptions,
  ): Promise<{ userId: string }>;
  createEmployee(
    data: TCreateEmployeeForm,
    ownerId: string,
  ): Promise<{ userId: string }>;
}
