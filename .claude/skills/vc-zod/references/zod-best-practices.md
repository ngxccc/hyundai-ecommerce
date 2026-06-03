# Zod Best Practices & Validation Patterns

Standardize schema validation, error formatting, and type safety across React frontend forms, Next.js Server Actions, and internal service layers.

---

## 1. Schema Validation in Next.js Server Actions

Server Actions must validate inputs at runtime before executing business logic. Never trust client-side validation.

### Standard Action Validation Pattern

Always use `safeParse` instead of `parse` to handle validation errors gracefully without crashing the request or bubbling unhandled exceptions.

```typescript
import { z } from "zod";
import { requireAuth } from "@/shared/lib/action-auth";

// 1. Define strict input schema
const createProductSchema = z
  .object({
    name: z.string().min(3, "errors.name_too_short").max(100),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, "errors.invalid_price_format"),
    categoryId: z.uuid("errors.invalid_category"),
  })
  .strict();

export async function createProductAction(rawInput: unknown) {
  try {
    // 2. Validate authentication and role
    await requireAuth();

    // 3. Safe parse the input payload
    const result = createProductSchema.safeParse(rawInput);
    if (!result.success) {
      // 4. Return structured validation errors
      return {
        success: false,
        error: "VALIDATION_ERROR",
        // Map ZodError to field-specific error messages
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const { name, price, categoryId } = result.data;

    // 5. Execute service call
    const product = await productService.create({ name, price, categoryId });
    return { success: true, data: product };
  } catch (error) {
    if (error instanceof Error && error.name === "AuthError") {
      return { success: false, error: "UNAUTHORIZED", message: error.message };
    }
    return { success: false, error: "INTERNAL_SERVER_ERROR" };
  }
}
```

---

## 2. Returning Translation Keys for Error Messages

To support multi-language localizations (e.g., English and Vietnamese) in storefront and admin apps:

- **Never** hardcode human-readable English or Vietnamese messages inside schema definitions.
- **Always** write namespace-prefixed localization key strings (e.g., `errors.invalid_email`, `validation.required`).
- The frontend or server component should wrap these keys in `t("key")` (from `next-intl`) during rendering.

### Example Schema with translation keys

```typescript
const registerSchema = z.object({
  email: z.email("validation.emailInvalid"),
  password: z
    .string()
    .min(8, "validation.passwordMinLength")
    .regex(/[A-Z]/, "validation.passwordNeedsUppercase"),
});
```

---

## 3. Formatting Custom Zod Errors

For dynamic multi-field checks (e.g. `password` and `confirmPassword` matching), use `.refine()` or `.superRefine()`.

### Example `.refine` pattern

```typescript
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "validation.password_min_length"),
    confirmPassword: z.string().min(1, "validation.confirm_required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "validation.passwords_do_not_match",
    path: ["confirmPassword"], // Point error specifically to confirmPassword field
  });
```

### Example `.superRefine` pattern for conditional checks

```typescript
const dealerVerificationSchema = z
  .object({
    businessType: z.enum(["individual", "dealer"]),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.businessType === "dealer") {
      if (!data.companyName || data.companyName.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "validation.company_name_required",
          path: ["companyName"],
        });
      }
      if (!data.taxId || data.taxId.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "validation.tax_id_required",
          path: ["taxId"],
        });
      }
    }
  });
```

---

## 4. Stripping and Coercing Inputs

- **Stripping**: Standard schemas should strip out extra keys (`.strip()`) or reject them outright (`.strict()`) to prevent malicious users from injecting untracked fields (e.g., `role: "admin"`) into database upserts.
- **Coercing**: Use `z.coerce` carefully when parsing incoming HTTP Query Parameters or FormData fields that arrive as plain strings:

  ```typescript
  const pageQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  });
  ```
