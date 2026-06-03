# Drizzle-Zod Database Schema Mapping

Standardize database schema mapping to Zod validation objects using `drizzle-zod` to avoid maintaining duplicate type definitions.

---

## 1. Mapped Schema Generation

`drizzle-zod` generates automatic validation schemas directly from Drizzle table structures.

### Select Schemas

Select schemas represent data as retrieved from the database (fully populated, including system-generated timestamps and IDs).

```typescript
import { createSelectSchema } from "drizzle-zod";
import { products } from "../schemas/products.schema";

// Schema for selecting products from DB
export const selectProductSchema = createSelectSchema(products);

// Export types inferred from select schema
export type TProduct = z.infer<typeof selectProductSchema>;
```

### Insert Schemas

Insert schemas represent data required to create a new database row. Fields with defaults (like serial IDs or `default()`) are automatically marked as optional.

```typescript
import { createInsertSchema } from "drizzle-zod";
import { products } from "../schemas/products.schema";

// Schema for inserting a product
export const insertProductSchema = createInsertSchema(products);

// Export types inferred from insert schema
export type TNewProduct = z.infer<typeof insertProductSchema>;
```

---

## 2. Refined Fields & Custom Validations

Auto-generated schemas do not enforce complex formatting (like email pattern matching or regex checks). You must override these fields using `drizzle-zod`'s override argument.

### Custom Validation Overrides

Always specify user-friendly validation error keys when overriding fields:

```typescript
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schemas/users.schema";

export const insertUserSchema = createInsertSchema(users, {
  // Override auto-generated fields with custom validation rules
  email: z.email("errors.invalid_email").trim().toLowerCase(),

  phone: z
    .string()
    .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "errors.invalid_phone_format"),

  role: z.enum(["admin", "dealer", "customer"]),
});
```

---

## 3. Creating Partial Update Schemas

To support PATCH or partial update requests, you can construct update validation schemas by making insert fields optional, or selecting subset of fields.

### Partial Update Pattern

```typescript
import { createInsertSchema } from "drizzle-zod";
import { products } from "../schemas/products.schema";

// 1. Generate full insert validation
const baseInsertProductSchema = createInsertSchema(products);

// 2. Make all fields optional for partial updates, keeping only ID required
export const updateProductSchema = baseInsertProductSchema
  .partial()
  .required({ id: true });

export type TUpdateProduct = z.infer<typeof updateProductSchema>;
```

### Scoped Update Pattern (Pick/Omit)

```typescript
// Allow editing only a subset of fields (e.g. price and description)
export const updateProductPriceSchema = baseInsertProductSchema.pick({
  price: true,
  description: true,
});
```

---

## 4. Best Practices

1. **Avoid Circular Imports**: Do not generate Zod schemas directly inside database schema files (`*.schema.ts`) if they import validation helpers that import other schemas. Keep mapped validation schemas in `packages/database/src/validators/` or a dedicated validation directory.
2. **Handle Decimals**: Drizzle `numeric`/`decimal` fields map to strings in TypeScript/Drizzle. Ensure your Zod overrides handle them as strings with appropriate decimal regex validation:

   ```typescript
   price: z.string().regex(/^\d+(\.\d{1,2})?$/, "errors.invalid_price_format");
   ```

3. **Handle Nullability**: Be aware of nullable columns in Drizzle (e.g., `text("desc").default(null)`). Zod schemas generated for these columns will permit `null`. If a form payload sends `undefined`, use `.nullable().optional()` or preprocess values to map empty strings/undefined to null.
