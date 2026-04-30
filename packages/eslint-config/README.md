# @nhatnang/eslint-config

Centralized ESLint configuration for the Hyundai E-Commerce monorepo.

## Exports

- **base** - Base ESLint rules for all projects
- **react** - React-specific rules (for admin-panel and UI packages)
- **next** - Next.js-specific rules (for storefront app)

## Usage

### In Root Config

```ts
import baseConfig from "@nhatnang/eslint-config/base";
import reactConfig from "@nhatnang/eslint-config/react";
import nextConfig from "@nhatnang/eslint-config/next";
```

### Configuration Structure

- **base.js** - Common TypeScript, ESM, and import rules applied to entire monorepo
- **react.js** - React-specific linting rules (NO storefront)
- **next.js** - Next.js core-web-vitals and TypeScript rules (storefront only)
