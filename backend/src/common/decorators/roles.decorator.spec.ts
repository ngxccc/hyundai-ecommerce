import { describe, expect, it } from "bun:test";
import { Roles, ROLES_KEY } from "./roles.decorator";
import { Reflector } from "@nestjs/core";

describe("Roles Decorator", () => {
  it("should set roles metadata on target handler when Roles decorator is applied", () => {
    class TestController {
      @Roles("admin", "customer")
      testRoute(): string {
        return "ok";
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "testRoute",
    );
    const handler = descriptor?.value as (...args: unknown[]) => unknown;

    const reflector = new Reflector();
    const roles = reflector.get<string[]>(ROLES_KEY, handler);

    expect(roles).toEqual(["admin", "customer"]);
  });
});
