import type { CreateEmployeeForm } from "../../validators";

export interface LoginOptions {
  headers?: HeadersInit;
  callbackURL?: string;
}

export interface RegisterOptions {
  callbackURL?: string;
}

export interface AuthService<TLogin = unknown, TRegister = unknown> {
  loginEmail(
    data: TLogin,
    options?: LoginOptions,
  ): Promise<{ userId: string }>;
  register(
    data: TRegister,
    options?: RegisterOptions,
  ): Promise<{ userId: string }>;
  createEmployee(
    data: CreateEmployeeForm,
    ownerId: string,
  ): Promise<{ userId: string }>;
}
