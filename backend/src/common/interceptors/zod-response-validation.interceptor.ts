import {
  Injectable,
  InternalServerErrorException,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type Observable } from "rxjs";
import { map } from "rxjs/operators";
import { z, type ZodType } from "zod";
import { env } from "@/env";

/**
 * Metadata key for storing target Zod response schemas and serialization options on controller route handlers.
 */
export const ZOD_RESPONSE_METADATA = "ZOD_RESPONSE_METADATA";

/**
 * Metadata key used by nestjs-zod's @ZodSerializerDto and @ZodResponse decorators.
 */
const NESTJS_ZOD_SERIALIZER_METADATA = "ZOD_SERIALIZER_DTO_OPTIONS";

/**
 * Configuration options attached to route handlers via response decorators.
 */
export interface ZodResponseMetadataOptions {
  /** Target DTO class or constructor with static .schema property */
  model?: unknown;
  /** Explicit Zod schema instance */
  schema?: ZodType;
  /** Indicates whether the response payload represents an array of items */
  isArray?: boolean;
  /** Indicates whether the response payload represents a paginated envelope */
  isPaginated?: boolean;
}

/**
 * Safely extracts a Zod schema from a DTO constructor or object holder.
 */
function extractZodSchema(target: unknown): ZodType | undefined {
  if (
    target !== null &&
    (typeof target === "object" || typeof target === "function")
  ) {
    if ("schema" in target && target.schema instanceof z.ZodType) {
      return target.schema;
    }
    if ("zodSchema" in target && target.zodSchema instanceof z.ZodType) {
      return target.zodSchema;
    }
  }
  return undefined;
}

/**
 * Intercepts outbound HTTP responses in development and test environments to enforce
 * strict schema validation against canonical Zod response definitions.
 *
 * Prevents silent API contract drift, hardcoded enum divergence, and nullability mismatches.
 * Automatically bypassed in production to guarantee zero serialization latency and overhead.
 */
@Injectable()
export class ZodResponseValidationInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Intercepts and validates controller response payloads against the bound response schema.
   *
   * @param context Current execution context
   * @param next CallHandler pipeline
   * @returns Observable of the validated response
   * @throws InternalServerErrorException when response data deviates from the declared contract
   */
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    // Zero CPU overhead in production: response parsing is strictly gated to development and test.
    if (
      env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "production"
    ) {
      return next.handle();
    }

    if (context.getType() !== "http") {
      return next.handle();
    }

    const handler = context.getHandler();
    const controller = context.getClass();

    const customMeta =
      this.reflector.get<ZodResponseMetadataOptions | undefined>(
        ZOD_RESPONSE_METADATA,
        handler,
      ) ??
      this.reflector.get<ZodResponseMetadataOptions | undefined>(
        ZOD_RESPONSE_METADATA,
        controller,
      );
    const serializerMeta =
      this.reflector.get<unknown>(NESTJS_ZOD_SERIALIZER_METADATA, handler) ??
      this.reflector.get<unknown>(NESTJS_ZOD_SERIALIZER_METADATA, controller);

    const resolved = this.resolveEffectiveSchema(customMeta, serializerMeta);
    if (!resolved) {
      return next.handle();
    }

    const { schema, isArray } = resolved;
    const targetSchema = isArray ? z.array(schema) : schema;

    return next.handle().pipe(
      map((payload: unknown) => {
        // Handle standard single envelope: { success: true, data: T, meta?: M }
        let valueToValidate = payload;
        if (
          payload !== null &&
          typeof payload === "object" &&
          "success" in payload &&
          "data" in payload
        ) {
          valueToValidate = payload.data;
        }
        const parseResult = targetSchema.safeParse(valueToValidate);

        if (!parseResult.success) {
          const formattedIssues = parseResult.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          }));

          const handlerName = `${controller.name}.${handler.name}`;
          throw new InternalServerErrorException({
            message: `API response contract validation failed for ${handlerName}`,
            handler: handlerName,
            issues: formattedIssues,
          });
        }

        return payload;
      }),
    );
  }

  /**
   * Resolves the canonical Zod schema and array flags from custom or nestjs-zod metadata.
   */
  private resolveEffectiveSchema(
    customMeta?: ZodResponseMetadataOptions,
    serializerMeta?: unknown,
  ): { schema: ZodType; isArray: boolean } | undefined {
    const isArrayPayload =
      customMeta?.isArray === true || customMeta?.isPaginated === true;

    if (customMeta?.schema) {
      return {
        schema: customMeta.schema,
        isArray: isArrayPayload,
      };
    }

    if (customMeta?.model) {
      const schema = extractZodSchema(customMeta.model);
      if (schema) {
        return {
          schema,
          isArray: isArrayPayload,
        };
      }
    }

    if (serializerMeta) {
      if (Array.isArray(serializerMeta) && serializerMeta.length > 0) {
        const schema = extractZodSchema(serializerMeta[0]);
        if (schema) {
          return { schema, isArray: true };
        }
      }

      const schema = extractZodSchema(serializerMeta);
      if (schema) {
        return { schema, isArray: false };
      }
    }

    return undefined;
  }
}
