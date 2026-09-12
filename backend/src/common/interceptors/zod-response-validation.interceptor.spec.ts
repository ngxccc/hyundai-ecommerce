import { describe, it, expect, beforeEach } from "bun:test";
import {
  type ExecutionContext,
  type CallHandler,
  InternalServerErrorException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { of, lastValueFrom } from "rxjs";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import {
  ZodResponseValidationInterceptor,
  ZOD_RESPONSE_METADATA,
} from "./zod-response-validation.interceptor";

const testItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  price: z.number().positive(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

class TestItemDto extends createZodDto(testItemSchema) {}

describe("ZodResponseValidationInterceptor", () => {
  let interceptor: ZodResponseValidationInterceptor;
  let reflector: Reflector;

  const createMockContext = (): ExecutionContext => {
    const handler = () => undefined;
    const controllerClass = class MockController {
      public readonly name = "MockController";
    };

    return {
      getType: () => "http",
      getHandler: () => handler,
      getClass: () => controllerClass,
      switchToHttp: () => ({
        getRequest: () => ({ method: "GET", url: "/test" }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (responseValue: unknown): CallHandler => ({
    handle: () => of(responseValue),
  });

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new ZodResponseValidationInterceptor(reflector);
  });

  describe("when intercepting controller responses", () => {
    it("should bypass response validation in production mode", async () => {
      const prevEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        const context = createMockContext();
        reflector.get = ((key: string) => {
          if (key === ZOD_RESPONSE_METADATA) {
            return { model: TestItemDto };
          }
          return undefined;
        }) as typeof reflector.get;

        // Invalid payload would throw if validation were active
        const invalidData = { id: "invalid-uuid", name: 123, price: -99 };
        const callHandler = createMockCallHandler({
          success: true,
          data: invalidData,
        });

        const result$ = interceptor.intercept(context, callHandler);
        const result = await lastValueFrom(result$);

        expect(result).toEqual({ success: true, data: invalidData });
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });
    it("should pass through unchanged when no response schema metadata is present", async () => {
      const context = createMockContext();
      const callHandler = createMockCallHandler({
        success: true,
        data: { arbitrary: "value" },
      });

      const result$ = interceptor.intercept(context, callHandler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        success: true,
        data: { arbitrary: "value" },
      });
    });

    it("should validate and return standard envelope response when data satisfies schema", async () => {
      const context = createMockContext();
      reflector.get = ((key: string) => {
        if (key === ZOD_RESPONSE_METADATA) {
          return { model: TestItemDto };
        }
        return undefined;
      }) as typeof reflector.get;

      const validData = {
        id: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
        name: "Hyundai Generator DHY65KSE",
        price: 245000000,
        status: "ACTIVE",
      };

      const callHandler = createMockCallHandler({
        success: true,
        data: validData,
      });

      const result$ = interceptor.intercept(context, callHandler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        success: true,
        data: validData,
      });
    });

    it("should throw InternalServerErrorException when response data fails schema validation", () => {
      const context = createMockContext();
      reflector.get = ((key: string) => {
        if (key === ZOD_RESPONSE_METADATA) {
          return { model: TestItemDto };
        }
        return undefined;
      }) as typeof reflector.get;

      const invalidData = {
        id: "not-a-uuid",
        name: "Hyundai Generator",
        price: -100, // Invalid: must be positive
        status: "UNKNOWN_STATUS", // Invalid: not in enum
      };

      const callHandler = createMockCallHandler({
        success: true,
        data: invalidData,
      });

      const result$ = interceptor.intercept(context, callHandler);
      expect(lastValueFrom(result$)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("should validate array response when isArray option is true", async () => {
      const context = createMockContext();
      reflector.get = ((key: string) => {
        if (key === ZOD_RESPONSE_METADATA) {
          return { model: TestItemDto, isArray: true };
        }
        return undefined;
      }) as typeof reflector.get;

      const validList = [
        {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
          name: "Item 1",
          price: 1000,
          status: "ACTIVE",
        },
        {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
          name: "Item 2",
          price: 2000,
          status: "INACTIVE",
        },
      ];

      const callHandler = createMockCallHandler({
        success: true,
        data: validList,
      });

      const result$ = interceptor.intercept(context, callHandler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        success: true,
        data: validList,
      });
    });
    it("should validate array payload when isPaginated is true even if isArray is explicitly false", async () => {
      const context = createMockContext();
      reflector.get = ((key: string) => {
        if (key === ZOD_RESPONSE_METADATA) {
          return { model: TestItemDto, isArray: false, isPaginated: true };
        }
        return undefined;
      }) as typeof reflector.get;

      const validList = [
        {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
          name: "Item 1",
          price: 1000,
          status: "ACTIVE",
        },
      ];

      const callHandler = createMockCallHandler({
        success: true,
        data: validList,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const result$ = interceptor.intercept(context, callHandler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        success: true,
        data: validList,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    });

    it("should throw when any element in an array fails schema validation", () => {
      const context = createMockContext();
      reflector.get = ((key: string) => {
        if (key === ZOD_RESPONSE_METADATA) {
          return { model: TestItemDto, isArray: true };
        }
        return undefined;
      }) as typeof reflector.get;

      const invalidList = [
        {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
          name: "Valid Item",
          price: 1000,
          status: "ACTIVE",
        },
        {
          id: "invalid-uuid",
          name: "Corrupt Item",
          price: "not-a-number",
          status: "INVALID",
        },
      ];

      const callHandler = createMockCallHandler({
        success: true,
        data: invalidList,
      });

      const result$ = interceptor.intercept(context, callHandler);
      expect(lastValueFrom(result$)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("should validate response when schema is registered via ZOD_SERIALIZER_DTO_OPTIONS", async () => {
      const context = createMockContext();
      reflector.get = ((key: string) => {
        if (key === "ZOD_SERIALIZER_DTO_OPTIONS") {
          return TestItemDto;
        }
        return undefined;
      }) as typeof reflector.get;

      const validData = {
        id: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
        name: "Direct DTO",
        price: 50000,
        status: "ACTIVE",
      };

      const callHandler = createMockCallHandler(validData);

      const result$ = interceptor.intercept(context, callHandler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual(validData);
    });

    it("should include detailed issue paths and messages when throwing InternalServerErrorException", async () => {
      const context = createMockContext();
      reflector.get = ((key: string) => {
        if (key === ZOD_RESPONSE_METADATA) {
          return { model: TestItemDto };
        }
        return undefined;
      }) as typeof reflector.get;

      const invalidData = {
        id: "invalid-uuid",
        name: "Test",
        price: -50,
        status: "WRONG",
      };

      const callHandler = createMockCallHandler({
        success: true,
        data: invalidData,
      });

      try {
        await lastValueFrom(interceptor.intercept(context, callHandler));
        expect().fail(
          "Expected interceptor to throw InternalServerErrorException",
        );
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        const response = (
          err as InternalServerErrorException
        ).getResponse() as {
          message: string;
          invalidParams?: unknown[];
        };
        expect(response.message).toContain(
          "API response contract validation failed",
        );
        expect(Array.isArray(response.invalidParams)).toBe(true);
        expect((response.invalidParams ?? []).length).toBeGreaterThan(0);
      }
    });
  });
});
