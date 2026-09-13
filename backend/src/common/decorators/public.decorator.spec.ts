import { describe, expect, it } from "bun:test";
import { Public, IS_PUBLIC_KEY } from "./public.decorator";
import { Reflector } from "@nestjs/core";

describe("Public Decorator", () => {
  it("should set isPublic metadata to true on target handler when Public decorator is applied", () => {
    class TestController {
      @Public()
      publicRoute(): string {
        return "ok";
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "publicRoute",
    );
    const handler = descriptor?.value as (...args: unknown[]) => unknown;

    const reflector = new Reflector();
    const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, handler);

    expect(isPublic).toBe(true);
  });

  it("should set isPublic metadata to true on target class when Public decorator is applied to class", () => {
    @Public()
    class TestClassController {
      someRoute(): string {
        return "ok";
      }
    }

    const reflector = new Reflector();
    const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestClassController);

    expect(isPublic).toBe(true);
  });
});
