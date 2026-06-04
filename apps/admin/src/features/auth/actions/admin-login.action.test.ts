import { expect, test, describe, beforeEach, type Mock } from "bun:test";
import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import type { adminLoginAction } from "./admin-login.action";
import type { AuthService } from "@nhatnang/database/services";

import "@nhatnang/shared/testing/action-mocks";

type LoginResult = Awaited<ReturnType<typeof adminLoginAction>>;

describe("adminLoginAction", () => {
  let loginEmailMock: Mock<AuthService["loginEmail"]>;

  beforeEach(async () => {
    const { authService } = await import("@nhatnang/database/services");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    loginEmailMock = authService.loginEmail as Mock<
      typeof authService.loginEmail
    >;
    loginEmailMock.mockClear();
  });

  test("returns validation error when input is invalid (empty)", async () => {
    const { adminLoginAction } = await import("./admin-login.action");

    // @ts-expect-error - testing invalid input
    const result = await adminLoginAction({});

    expect(result.success).toBe(false);
    expect(result.success === false && result.code).toBe(
      SYSTEM_ERROR_CODES.VALIDATION_ERROR,
    );
    expect(result).toHaveProperty("fieldErrors");
    expect(loginEmailMock).not.toHaveBeenCalled();
  });

  test("calls authService.loginEmail and returns its result when input is valid", async () => {
    const { adminLoginAction } = await import("./admin-login.action");
    const { headers } = await import("next/headers");

    const mockSuccessResponse: LoginResult = {
      success: true,
      data: { userId: "1" },
    };
    loginEmailMock.mockResolvedValueOnce({ userId: "1" });

    const validData = {
      email: "admin@example.com",
      password: "Password123!",
      rememberMe: true,
    };

    const result = await adminLoginAction(validData);

    expect(loginEmailMock).toHaveBeenCalledTimes(1);
    expect(loginEmailMock).toHaveBeenCalledWith(
      {
        email: validData.email,
        password: validData.password,
      },
      { headers: await headers() },
    );
    expect(result).toEqual(mockSuccessResponse);
  });
});
