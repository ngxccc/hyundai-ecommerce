"use server";

import { auth, isAPIError } from "@nhatnang/database/auth";
import { createRegisterSchema } from "../schemas/auth.schema";
import type { TRegisterForm } from "../schemas/auth.schema";
import { checkDuplicateUser } from "@nhatnang/database/queries";
import {
  AUTH_ERROR_CODES,
  SYSTEM_ERROR_CODES,
} from "@nhatnang/shared/constants";
import { z } from "zod";

export async function registerAction(data: TRegisterForm) {
  const schema = createRegisterSchema((key: string) => key);
  const parsed = await schema.safeParseAsync(data);

  if (!parsed.success) {
    return {
      success: false,
      errorCode: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const validatedData = parsed.data;

  const duplicateRecord = await checkDuplicateUser(
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
      success: false,
      fieldErrors,
    };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.fullName,
        phone: validatedData.phone,
        companyName: validatedData.companyName,
        taxId: validatedData.taxId,
        businessType: validatedData.businessType,
        province: validatedData.province,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error (server):", error);

    if (isAPIError(error)) {
      return {
        success: false,
        errorCode: error.message,
      };
    }

    return {
      success: false,
      errorCode: SYSTEM_ERROR_CODES.INTERNAL_SERVER_ERROR,
    };
  }
}
