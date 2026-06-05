---
title: Apply String Validations at Schema Definition
impact: CRITICAL
impactDescription: Unvalidated strings allow SQL injection, XSS, and malformed data; validating at schema level catches issues at the boundary
tags: schema, string, validation, security
---

## Apply String Validations at Schema Definition

Plain `z.string()` accepts any string including empty strings, extremely long strings, and malicious content. In Zod v4, format validations have been promoted to top-level helper functions (`z.email()`, `z.url()`, `z.uuid()`) for tree-shaking, and custom error messages are passed using the unified `{ error: "..." }` options object.

Apply constraints like `min()`, `max()`, or `regex()` at schema definition to reject invalid data at the boundary.

**Incorrect (legacy/no string validations):**

```typescript
import { z } from "zod";

const commentSchema = z.object({
  author: z.string(), // Empty string passes
  email: z.email(), // Legacy Zod v3 chained format
  content: z.string(), // 10MB string passes
  website: z.url().optional(), // Legacy Zod v3 chained format
});
```

**Correct (Zod v4 string validations applied):**

```typescript
import { z } from "zod";

const commentSchema = z.object({
  author: z
    .string()
    .min(1, { error: "Author is required" })
    .max(100, { error: "Author name too long" }),

  email: z.email({ error: "Invalid email address" }),

  content: z
    .string()
    .min(1, { error: "Comment cannot be empty" })
    .max(5000, { error: "Comment too long" }),

  website: z
    .url({ error: "Invalid URL" })
    .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
      error: "Only http/https URLs allowed",
    })
    .optional(),
});

// Invalid data is rejected
commentSchema.parse({
  author: "",
  email: "invalid",
  content: "",
});
// ZodError with all violations listed
```

**Common Zod v4 validations:**

```typescript
z.string().min(1, { error: "Required" }); // Non-empty (most common need)
z.string().max(255); // Database varchar limit
z.string().length(36); // Exact length (e.g., hash keys)
z.email(); // Email format (top-level)
z.url(); // URL format (top-level)
z.uuid(); // UUID format (top-level)
z.string().regex(/^[a-z0-9-]+$/); // Custom pattern (slugs)
z.string().startsWith("https://"); // Prefix check
z.string().endsWith(".pdf"); // Suffix check
z.string().includes("@"); // Contains check
z.string().trim(); // Strips whitespace (transform)
z.string().toLowerCase(); // Normalizes case (transform)
```

**When NOT to use this pattern:**

- When accepting arbitrary user content for display only (sanitize on output instead)
- When building a passthrough/proxy that shouldn't validate content

Reference: [Zod API - Strings](https://zod.dev/api#strings)
