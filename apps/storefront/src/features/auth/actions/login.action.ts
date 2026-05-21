"use server";

import { auth, isAPIError } from "@nhatnang/database/auth";
import { createLoginSchema, type TLoginForm } from "../schemas/auth.schema";
import { headers } from "next/headers";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { z } from "zod";
import type { TAuthActionResult } from "../types/auth.types";

export const loginAction = async (
  data: TLoginForm,
): Promise<TAuthActionResult<keyof TLoginForm & string>> => {
  const schema = createLoginSchema((key) => key);
  const parsed = await schema.safeParseAsync(data);

  if (!parsed.success) {
    return {
      success: false,
      errorCode: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const validatedData = parsed.data;

  try {
    await auth.api.signInEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        callbackURL: "/dashboard",
      },
      asResponse: false,
      headers: await headers(),
    });

    return { success: true };
  } catch (error) {
    console.error("Login error (server):", error);

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
};
