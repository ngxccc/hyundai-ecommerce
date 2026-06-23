"use server";

import { getCachedSession } from "@/shared/lib/session";
import { authService, userService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { revalidateTag } from "next/cache";
import {
  createEmployeeSchema,
  type TCreateEmployeeForm,
} from "@nhatnang/database/validators";
import { validateSchema } from "@/shared/lib/validation";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";

export async function listEmployeesAction() {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (session?.user?.role !== "DEALER_APPROVER") {
    return { success: false as const, error: t("unauthorized") };
  }

  try {
    const employees = await userService.listEmployees(session.user.id);
    return { success: true as const, data: employees };
  } catch (error) {
    console.error("[listEmployeesAction]", error);
    return { success: false as const, error: t("internalServerError") };
  }
}

export async function createEmployeeAction(data: TCreateEmployeeForm) {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (session?.user?.role !== "DEALER_APPROVER") {
    return { success: false as const, error: t("unauthorized") };
  }

  const validation = validateSchema(createEmployeeSchema, data);
  if (!validation.success) {
    return validation;
  }

  const validatedData = validation.data;

  // Check duplicate
  const duplicateRecord = await userService.checkDuplicateUser(
    validatedData.email,
    validatedData.phone,
  );

  if (duplicateRecord) {
    const fieldErrors: Record<string, string[]> = {};

    if (duplicateRecord.email === validatedData.email) {
      fieldErrors["email"] = [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS];
    }
    if (duplicateRecord.phone === validatedData.phone) {
      fieldErrors["phone"] = [AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS];
    }

    return {
      success: false as const,
      code: "VALIDATION_ERROR" as const,
      fieldErrors,
    };
  }

  try {
    await authService.createEmployee(validatedData, session.user.id);
    revalidateTag(`employees-${session.user.id}`, "default");
    return { success: true as const };
  } catch (error) {
    console.error("[createEmployeeAction]", error);
    if (error instanceof Error && error.message.startsWith("errors.")) {
      const key = error.message.replace("errors.", "");
      // @ts-expect-error - dynamic key
      return { success: false as const, error: t(key) };
    }
    return { success: false as const, error: t("internalServerError") };
  }
}
