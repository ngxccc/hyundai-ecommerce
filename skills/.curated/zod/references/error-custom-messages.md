---
title: Provide Custom Error Messages
impact: HIGH
impactDescription: Default messages like "Expected string, received number" confuse users; custom messages like "Email is required" are actionable
tags: error, messages, user-experience, validation
---

## Provide Custom Error Messages

Zod's default error messages are technical and confusing for end users. In Zod v4, the fragmented error customization parameters (`required_error`, `invalid_type_error`, `message`) have been unified into a **single, unified `error` parameter**. Provide custom messages using `{ error: "..." }` or a dynamic issue callback to make validation failures clear, specific, and actionable.

**Incorrect (legacy/default error messages):**

```typescript
import { z } from "zod";

const signupSchema = z.object({
  email: z
    .string({
      error: "Email is required", // Deprecated in v4
      error: "Email must be text", // Deprecated in v4
    })
    .email("Please enter a valid email address"), // Deprecated/legacy message argument

  password: z.string().min(8, { error: "Password too short" }), // Legacy string message format
});
```

**Correct (Zod v4 custom error messages):**

```typescript
import { z } from "zod";

const signupSchema = z.object({
  email: z.email({
    error: (issue) =>
      issue.code === "invalid_type"
        ? issue.received === "undefined"
          ? "Email is required"
          : "Email must be text"
        : "Please enter a valid email address",
  }),

  password: z
    .string({
      error: "Password is required",
    })
    .min(8, { error: "Password must be at least 8 characters" }),

  age: z
    .number({
      error: (issue) =>
        issue.received === "undefined"
          ? "Age is required"
          : "Age must be a number",
    })
    .min(18, { error: "You must be at least 18 years old" }),
});

signupSchema.parse({ email: "bad", password: "123", age: 15 });
// ZodError issues:
// - "Please enter a valid email address"
// - "Password must be at least 8 characters"
// - "You must be at least 18 years old"
```

**Message types and when they trigger:**

```typescript
const schema = z
  .string({
    error: (issue) => {
      if (issue.code === "invalid_type") {
        return issue.received === "undefined"
          ? "This field is required"
          : "This field must be text";
      }
    },
  })
  .min(1, { error: "Cannot be empty" })
  .max(100, { error: "Too long" });
```

**Using error maps for consistent global messaging in Zod v4:**

```typescript
import { z } from "zod";

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === "string") {
      return { message: `Must be at least ${issue.minimum} characters` };
    }
    if (issue.type === "number") {
      return { message: `Must be at least ${issue.minimum}` };
    }
  }

  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === "string") {
      return { message: "Must be text" };
    }
  }

  // Default to Zod's message
  return { message: ctx.defaultError };
};

// Apply globally
z.setErrorMap(customErrorMap);
```

**Good error message principles:**

- Say what's wrong: "Password too short" not "Invalid password"
- Say how to fix it: "at least 8 characters" not just "too short"
- Use user's language: "email" not "string field at path .email"
- Be specific: "Must be a positive number" not "Invalid"

**When NOT to use this pattern:**

- Internal development scripts where technical errors are fine
- When you'll map errors to user-facing messages in the UI layer

Reference: [Zod Error Customization](https://zod.dev/error-customization)
