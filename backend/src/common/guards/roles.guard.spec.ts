import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import type { Request } from "express";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let mockReflector: { getAllAndOverride: ReturnType<typeof mock> };

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: mock(),
    };
    guard = new RolesGuard(mockReflector as unknown as Reflector);
  });

  const createMockContext = (user?: { role: string }) => {
    const req = { user } as unknown as Request;
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  describe("canActivate", () => {
    describe("when no roles are required", () => {
      it("should return true when role metadata is undefined", () => {
        mockReflector.getAllAndOverride.mockReturnValue(undefined);
        const ctx = createMockContext({ role: "customer" });

        expect(guard.canActivate(ctx)).toBe(true);
      });

      it("should return true when role metadata is an empty array", () => {
        mockReflector.getAllAndOverride.mockReturnValue([]);
        const ctx = createMockContext({ role: "customer" });

        expect(guard.canActivate(ctx)).toBe(true);
      });
    });

    describe("when roles are required", () => {
      it("should return true when user has matching role", () => {
        mockReflector.getAllAndOverride.mockReturnValue(["admin", "manager"]);
        const ctx = createMockContext({ role: "admin" });

        expect(guard.canActivate(ctx)).toBe(true);
      });

      it("should throw ForbiddenException when user has different role", () => {
        mockReflector.getAllAndOverride.mockReturnValue(["admin"]);
        const ctx = createMockContext({ role: "customer" });

        expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      });

      it("should throw ForbiddenException when user is not present on request", () => {
        mockReflector.getAllAndOverride.mockReturnValue(["admin"]);
        const ctx = createMockContext(undefined);

        expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });
  });
});
