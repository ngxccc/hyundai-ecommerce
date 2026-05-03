"use server";

import { auth, isAPIError } from "@nhatnang/database/auth";
import { createRegisterSchema } from "../schemas/auth.schema";
import type { TRegisterForm } from "../schemas/auth.schema";

export async function registerAction(data: TRegisterForm) {
  try {
    const schema = createRegisterSchema((key: string) => key);
    const validatedData = schema.parse(data);

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

    return {
      success: true,
    };
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
      errorCode: "INTERNAL_SERVER_ERROR",
    };
  }
}
