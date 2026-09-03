import { expect, test, describe, spyOn } from "bun:test";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { authService } from "@nhatnang/database/services";
import { headers } from "next/headers";
import { adminLoginAction } from "./admin-login.action";

describe("adminLoginAction", () => {
  test("returns validation error when input is invalid (empty)", async () => {
    const loginEmailSpy = spyOn(authService, "loginEmail");
    // @ts-expect-error - testing invalid input
    const result = await adminLoginAction({});

    expect(result.success).toBe(false);
    expect(result.success === false && result.code).toBe(
      SYSTEM_ERROR_CODES.VALIDATION_ERROR,
    );
    expect(result).toHaveProperty("fieldErrors");
    expect(loginEmailSpy).not.toHaveBeenCalled();
    loginEmailSpy.mockRestore();
  });

  test("calls authService.loginEmail and returns its result when input is valid", async () => {
    const loginEmailSpy = spyOn(
      authService,
      "loginEmail",
    ).mockResolvedValueOnce({ userId: "1" });

    const validData = {
      email: "admin@example.com",
      password: "Password123!",
      rememberMe: true,
    };

    const result = await adminLoginAction(validData);

    expect(loginEmailSpy).toHaveBeenCalledTimes(1);
    expect(loginEmailSpy).toHaveBeenCalledWith(
      {
        email: validData.email,
        password: validData.password,
      },
      { headers: await headers() },
    );
    expect(result).toEqual({
      success: true,
      data: { userId: "1" },
    });
    loginEmailSpy.mockRestore();
  });
});
