/**
 * Extracts runtime enums mapped by explicit Schema.Property paths from an OpenAPI document.
 * This guarantees no collision (e.g. UserResponseDto.status vs OrderResponseDto.status).
 */
export function extractRuntimeEnums(doc: Record<string, unknown>): string {
  const components = (doc["components"] ?? {}) as Record<string, unknown>;
  const schemas = (components["schemas"] ?? {}) as Record<
    string,
    Record<string, unknown>
  >;

  // Target schema mappings: [ConstantName, SchemaName, PropertyPath, FallbackEnum?]
  const TARGET_ENUMS: {
    constant: string;
    schema: string;
    prop: string;
    subProp?: string;
  }[] = [
    { constant: "USER_ROLES", schema: "UserResponseDto", prop: "role" },
    {
      constant: "BUSINESS_TYPES",
      schema: "UserResponseDto",
      prop: "dealerCompany",
      subProp: "businessType",
    },
    { constant: "USER_STATUSES", schema: "UserResponseDto", prop: "status" },
    { constant: "ORDER_STATUSES", schema: "OrderResponseDto", prop: "status" },
    {
      constant: "ORDER_PAYMENT_STATUSES",
      schema: "OrderResponseDto",
      prop: "paymentStatus",
    },
    {
      constant: "ORDER_PAYMENT_METHODS",
      schema: "OrderResponseDto",
      prop: "paymentMethod",
    },
    {
      constant: "ORDER_APPROVAL_STATUSES",
      schema: "OrderResponseDto",
      prop: "approvalStatus",
    },
    {
      constant: "QUOTE_STATUSES",
      schema: "AdminQuoteResponseDto",
      prop: "status",
    },
    { constant: "LEAD_STATUSES", schema: "LeadResponseDto", prop: "status" },
  ];

  function extractEnumFromProperty(propObj: unknown): string[] | null {
    if (!propObj || typeof propObj !== "object") return null;
    const p = propObj as Record<string, unknown>;

    if (
      Array.isArray(p["enum"]) &&
      p["enum"].every((v) => typeof v === "string")
    ) {
      return p["enum"];
    }

    // Handle anyOf / oneOf wrappers (e.g. nullable enums)
    const variants = (p["anyOf"] ?? p["oneOf"]) as unknown[];
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v && typeof v === "object") {
          const res = extractEnumFromProperty(v);
          if (res) return res;
        }
      }
    }

    return null;
  }

  const results: Record<string, string[]> = {};

  for (const target of TARGET_ENUMS) {
    const schema = schemas[target.schema];
    if (!schema) continue;

    const properties = (schema["properties"] ?? {}) as Record<
      string,
      Record<string, unknown>
    >;
    const propNode = properties[target.prop];
    if (!propNode) continue;

    if (target.subProp) {
      // Traverse nested object properties (e.g. dealerCompany.businessType)
      const subVariants = (propNode["anyOf"] ?? [propNode]) as unknown[];
      let found: string[] | null = null;

      for (const sub of subVariants) {
        if (!sub || typeof sub !== "object") continue;
        const subProps = ((sub as Record<string, unknown>)["properties"] ??
          {}) as Record<string, unknown>;
        const subNode = subProps[target.subProp];
        found = extractEnumFromProperty(subNode);
        if (found) break;
      }

      if (found) {
        results[target.constant] = found;
      }
    } else {
      const found = extractEnumFromProperty(propNode);
      if (found) {
        results[target.constant] = found;
      }
    }
  }

  const lines: string[] = [
    "/**",
    " * AUTO-GENERATED RUNTIME CONSTANTS FROM OPENAPI SPECIFICATION",
    " * Do not edit directly. Re-run `bun run types:sync` or `bun run types:pull`.",
    " */",
    "",
  ];

  for (const [constantName, values] of Object.entries(results)) {
    lines.push(`export const ${constantName} = [`);
    for (const val of values) {
      lines.push(`  ${JSON.stringify(val)},`);
    }
    lines.push(`] as const;`);
    lines.push(
      `export type ${toPascalCase(constantName)}Type = (typeof ${constantName})[number];`,
    );
    lines.push("");
  }

  return lines.join("\n");
}

function toPascalCase(str: string): string {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
