import { createZodDto as baseCreateZodDto } from "nestjs-zod";

/**
 * Enhanced createZodDto wrapper that bridges Zod 4's JSON Schema 2020-12 representations
 * with @nestjs/swagger's metadata explorer.
 *
 * Automatically transforms multi-type nullable arrays (e.g. ["string", "null"]) into
 * canonical `{ type: "string", nullable: true }` metadata, preventing @nestjs/swagger from
 * erroneously converting nullable primitive types into array schemas.
 *
 * @param schema Source canonical Zod schema
 * @param options Optional nestjs-zod creation options
 */
export const createZodDto: typeof baseCreateZodDto = (schema, options) => {
  const dtoClass = baseCreateZodDto(schema, options);

  const origFactory = (
    dtoClass as unknown as {
      _OPENAPI_METADATA_FACTORY?: () => Record<string, Record<string, unknown>>;
    }
  )._OPENAPI_METADATA_FACTORY;

  if (typeof origFactory === "function") {
    (
      dtoClass as unknown as {
        _OPENAPI_METADATA_FACTORY: () => Record<
          string,
          Record<string, unknown>
        >;
      }
    )._OPENAPI_METADATA_FACTORY = function () {
      const meta = origFactory.call(this);
      for (const prop of Object.values(meta)) {
        if (Array.isArray(prop["type"]) && prop["type"].includes("null")) {
          const nonNullTypes = (prop["type"] as string[]).filter(
            (t) => t !== "null",
          );
          prop["nullable"] = true;
          prop["type"] =
            nonNullTypes.length === 1 ? nonNullTypes[0] : nonNullTypes;
        }
      }
      return meta;
    };
  }

  return dtoClass;
};
