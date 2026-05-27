"use server";

import { headers } from "next/headers";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { z } from "zod";
import { authService } from "@nhatnang/database/services";
import {
  createLoginSchema,
  type TLoginForm,
} from "@nhatnang/database/validators";

export const loginAction = async (data: TLoginForm) => {
  const schema = createLoginSchema((key) => key);
  const parsed = await schema.safeParseAsync(data);

  if (!parsed.success) {
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  return authService.loginEmail(parsed.data, {
    headers: await headers(),
  });
};
