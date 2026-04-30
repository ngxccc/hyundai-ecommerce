# @nhatnang/typescript-config

Centralized TypeScript configuration for the Hyundai E-Commerce monorepo.

## Exports

- **base.json** - Base TypeScript compiler options for all projects
- **next.json** - Next.js-specific TypeScript configuration

## Usage

### Base Config (Root Level)

```json
{
  "extends": "./packages/typescript-config/base.json"
}
```

### Next.js Config (Storefront)

```json
{
  "extends": "../../packages/typescript-config/next.json"
}
```

## Configuration Structure

- **base.json** - ESNext target, bundler module resolution, strict mode
- **next.json** - Extends base.json with Next.js plugin configuration
