import { describe, expect, it, mock, beforeEach } from "bun:test";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { JwtService } from "@nestjs/jwt";
import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let mockJwtService: { verifyAsync: ReturnType<typeof mock> };

  beforeEach(() => {
    mockJwtService = {
      verifyAsync: mock(),
    };
    guard = new JwtAuthGuard(mockJwtService as unknown as JwtService);
  });

  const createMockContext = (authHeader?: string) => {
    const req = {
      headers: {
        authorization: authHeader,
      },
    } as unknown as Request;

    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it("should allow request and attach user payload when token is valid", async () => {
    const validPayload = {
      sub: "user-123",
      email: "alex@example.com",
      role: "customer",
    };
    mockJwtService.verifyAsync.mockResolvedValue(validPayload);

    const ctx = createMockContext("Bearer valid.jwt.token");
    const canActivate = await guard.canActivate(ctx);

    expect(canActivate).toBe(true);
    const req = ctx.switchToHttp().getRequest<Request>();
    expect(req.user).toEqual(validPayload);
  });

  it("should throw UnauthorizedException when Authorization header is missing", () => {
    const ctx = createMockContext(undefined);

    expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when Authorization header is not Bearer scheme", () => {
    const ctx = createMockContext("Basic user:pass");

    expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when token verification fails", () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error("jwt expired"));

    const ctx = createMockContext("Bearer expired.jwt.token");

    expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
