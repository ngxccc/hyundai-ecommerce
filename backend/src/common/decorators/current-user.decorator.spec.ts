import { describe, expect, it } from "bun:test";
import { CurrentUser, type JwtPayload } from "./current-user.decorator";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import type { ExecutionContext } from "@nestjs/common";

describe("CurrentUser Decorator", () => {
  class TestController {
    testMethod(
      @CurrentUser() user: JwtPayload,
      @CurrentUser("email") email: string,
    ): { user: JwtPayload; email: string } {
      return { user, email };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestController,
    "testMethod",
  );

  const entries = Object.values(
    metadata as Record<
      string,
      {
        factory: (
          data: keyof JwtPayload | undefined,
          ctx: ExecutionContext,
        ) => unknown;
      }
    >,
  );

  const fullUserFactory = entries[1]?.factory;
  const fieldFactory = entries[0]?.factory;

  const mockUser: JwtPayload = {
    sub: "user-123",
    email: "test@example.com",
    role: "customer",
  };

  const createMockContext = (user?: JwtPayload) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it("should extract full user object from execution context when no property is passed", () => {
    const ctx = createMockContext(mockUser);
    const result = fullUserFactory?.(undefined, ctx);

    expect(result).toEqual(mockUser);
  });

  it("should extract specific user property from execution context when property name is provided", () => {
    const ctx = createMockContext(mockUser);
    const result = fieldFactory?.("email", ctx);

    expect(result).toBe("test@example.com");
  });

  it("should return undefined when request has no user", () => {
    const ctx = createMockContext(undefined);
    const result = fullUserFactory?.(undefined, ctx);

    expect(result).toBeUndefined();
  });
});
