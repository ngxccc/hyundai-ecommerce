import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { ROLES_KEY } from "@/common/decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "@/common/decorators/public.decorator";
import type { Request } from "express";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let mockReflector: { getAllAndOverride: ReturnType<typeof mock> };
  const setupReflector = (options: {
    isPublic?: boolean;
    roles?: string[];
  }) => {
    mockReflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY) return options.isPublic ?? false;
      if (key === ROLES_KEY) return options.roles;
      return undefined;
    });
  };

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: mock((key: string) => {
        if (key === IS_PUBLIC_KEY) return false;
        return undefined;
      }),
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
    describe("when route is public", () => {
      it("should return true when route is marked as public without user", () => {
        setupReflector({ isPublic: true });
        const ctx = createMockContext(undefined);

        expect(guard.canActivate(ctx)).toBe(true);
      });

      it("should return true when route is marked as public even if roles are configured", () => {
        setupReflector({ isPublic: true, roles: ["ADMIN"] });
        const ctx = createMockContext(undefined);

        expect(guard.canActivate(ctx)).toBe(true);
      });
    });

    describe("when no roles are required", () => {
      it("should return true when role metadata is undefined", () => {
        setupReflector({ roles: undefined });
        const ctx = createMockContext({ role: "SALES" });

        expect(guard.canActivate(ctx)).toBe(true);
      });

      it("should return true when role metadata is an empty array", () => {
        setupReflector({ roles: [] });
        const ctx = createMockContext({ role: "SALES" });

        expect(guard.canActivate(ctx)).toBe(true);
      });
    });

    describe("when roles are required", () => {
      it("should return true when user has matching role", () => {
        setupReflector({ roles: ["ADMIN", "SALES"] });
        const ctx = createMockContext({ role: "ADMIN" });

        expect(guard.canActivate(ctx)).toBe(true);
      });

      it("should throw ForbiddenException when user has different role", () => {
        setupReflector({ roles: ["ADMIN"] });
        const ctx = createMockContext({ role: "SALES" });

        expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      });

      it("should throw ForbiddenException when user is not present on request", () => {
        setupReflector({ roles: ["ADMIN"] });
        const ctx = createMockContext(undefined);

        expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });
  });
});
