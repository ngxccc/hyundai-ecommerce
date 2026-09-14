import { describe, expect, it } from "bun:test";
import { Reflector } from "@nestjs/core";
import { ApiAuth } from "./api-auth.decorator";
import { ROLES_KEY } from "./roles.decorator";

type SwaggerSecurityRequirement = Record<string, string[]>;
type SwaggerResponseMap = Record<string, { description?: string }>;

describe("ApiAuth Decorator", () => {
  const reflector = new Reflector();

  describe("when roles are provided", () => {
    class RoleGuardedController {
      @ApiAuth("ADMIN", "SALES")
      adminRoute(): string {
        return "ok";
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      RoleGuardedController.prototype,
      "adminRoute",
    );
    const handler = descriptor?.value as (...args: unknown[]) => unknown;

    it("should set roles metadata matching the provided arguments", () => {
      const roles = reflector.get<string[]>(ROLES_KEY, handler);
      expect(roles).toEqual(["ADMIN", "SALES"]);
    });

    it("should set Swagger security metadata for bearer authentication", () => {
      const security = reflector.get<SwaggerSecurityRequirement[]>(
        "swagger/apiSecurity",
        handler,
      );
      expect(security).toBeDefined();
      expect(security).toContainEqual({ bearer: [] });
    });

    it("should set Swagger response metadata for 401 and 403 RFC 9457 errors", () => {
      const responses = reflector.get<SwaggerResponseMap>(
        "swagger/apiResponse",
        handler,
      );
      expect(responses).toBeDefined();
      expect(responses["401"]).toBeDefined();
      expect(responses["403"]).toBeDefined();
    });
  });

  describe("when roles are omitted", () => {
    class AuthenticatedOnlyController {
      @ApiAuth()
      profileRoute(): string {
        return "ok";
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      AuthenticatedOnlyController.prototype,
      "profileRoute",
    );
    const handler = descriptor?.value as (...args: unknown[]) => unknown;

    it("should NOT set roles metadata (leaving role access unrestricted)", () => {
      const roles = reflector.get<string[] | undefined>(ROLES_KEY, handler);
      expect(roles).toBeUndefined();
    });

    it("should still set Swagger security metadata for bearer authentication", () => {
      const security = reflector.get<SwaggerSecurityRequirement[]>(
        "swagger/apiSecurity",
        handler,
      );
      expect(security).toBeDefined();
      expect(security).toContainEqual({ bearer: [] });
    });

    it("should set Swagger response metadata for 401 and 403 RFC 9457 errors", () => {
      const responses = reflector.get<SwaggerResponseMap>(
        "swagger/apiResponse",
        handler,
      );
      expect(responses).toBeDefined();
      expect(responses["401"]).toBeDefined();
      expect(responses["403"]).toBeDefined();
    });
  });
});
