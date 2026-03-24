# Configuration & Dependency Architecture - Three-Tier Model

This document outlines the complete refactoring of configurations and dependencies across a monorepo using a three-tier architecture.

## 📊 Architecture Overview

```txt
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1: ROOT LEVEL (Network Management Tools Only)              │
│ • turbo (Orchestration)                                         │
│ • typescript (Base version reference)                           │
│ • prettier (Global code formatting)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ TIER 2: PACKAGES (Shared Configurations & Infrastructure)       │
│                                                                 │
│ ├─ @repo/eslint-config (ESLint rules & resolvers)             │
│ │   ├─ Dependencies:                                           │
│ │   │  • @eslint/js                                           │
│ │   │  • @eslint-react/eslint-plugin                          │
│ │   │  • eslint-config-next                                   │
│ │   │  • eslint-config-prettier                               │
│ │   │  • eslint-plugin-import-x                               │
│ │   │  • eslint-import-resolver-typescript                    │
│ │   │  • typescript-eslint                                    │
│ │   │  • globals                                              │
│ │   ├─ Exports: base.js, react.js, next.js                   │
│ │   └─ Usage: workspace:* in consuming apps                   │
│ │                                                            │
│ ├─ @repo/typescript-config (TypeScript settings)              │
│ │   ├─ Exports: base.json, next.json                          │
│ │   └─ Extended by tsconfig.json files                        │
│ │                                                            │
│ └─ Other packages (database, types, ui, etc.)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ TIER 3: APPS (Consumers - Framework & App-Specific Deps Only)   │
│                                                                 │
│ ├─ apps/storefront (Next.js app)                              │
│ │   ├─ Dependencies:                                          │
│ │   │  • next                                                 │
│ │   │  • react                                                │
│ │   │  • react-dom                                            │
│ │   ├─ devDependencies:                                       │
│ │   │  • @repo/eslint-config (workspace:*)                    │
│ │   │  • eslint                                               │
│ │   │  • tailwindcss                                          │
│ │   │  • TypeScript types                                     │
│ │   └─ ESLint: Only uses base + next.js rules                │
│ │                                                            │
│ ├─ apps/admin-panel (React app)                              │
│ │   └─ Similar structure with base + react rules             │
│ │                                                            │
│ ├─ apps/api-server (Backend)                                 │
│ │   └─ Minimal frontend dependencies                         │
│ │                                                            │
│ └─ Other apps...                                              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Dependency Graph

### Root Package Dependencies

```json
{
  "devDependencies": {
    "turbo": "^2.8.20",           // Monorepo orchestration
    "typescript": "^5.9.3",       // TS base reference
    "prettier": "^3.0.0",         // Global formatting
    "@types/bun": "latest"
  }
}
```

### @repo/eslint-config Dependencies

```json
{
  "dependencies": {
    "@eslint/js": "^10.0.1",
    "@eslint-react/eslint-plugin": "^3.0.0",
    "eslint": "^9",
    "eslint-config-next": "^16.2.1",
    "eslint-config-prettier": "^10.1.8",
    "eslint-import-resolver-typescript": "^4.4.4",
    "eslint-plugin-import-x": "^4.16.2",
    "globals": "^17.4.0",
    "typescript-eslint": "^8.57.1"
  }
}
```

### apps/storefront Dependencies

```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",  // ← Shared config
    "eslint": "^9",                        // ← Runtime for ESLint
    "tailwindcss": "^4",                   // ← App-specific styling
    "typescript": "^5"                     // ← App TS version
  }
}
```

## ✂️ Changes Made

### 1️⃣ ROOT: Removed Framework Dependencies

**Removed** from root `package.json`:

- ❌ `@eslint-react/eslint-plugin`
- ❌ `@eslint/js`
- ❌ `eslint`
- ❌ `eslint-config-next`
- ❌ `eslint-config-prettier`
- ❌ `eslint-import-resolver-typescript`
- ❌ `eslint-plugin-import-x`
- ❌ `globals`
- ❌ `typescript-eslint`

**Kept**:

- ✅ `turbo` - Monorepo orchestration tool
- ✅ `typescript` - Base version reference only
- ✅ `prettier` - Global code formatting
- ✅ `@types/bun` - Type definitions

### 2️⃣ PACKAGES: Consolidated ESLint Config

**Created** `packages/eslint-config/package.json`:

- Moved **ALL** ESLint dependencies here
- Exports: `base.js`, `react.js`, `next.js`
- Dependencies: Everything needed for linting
- PeerDependencies: `eslint`, `typescript`

**Package Structure**:

```txt
packages/eslint-config/
├── package.json
├── index.js          (Re-exports all configs)
├── base.js           (Base rules: TypeScript, ESM, imports)
├── react.js          (React environment rules)
├── next.js           (Next.js web vitals)
└── README.md
```

### 3️⃣ APPS: Consumer Linking

**Updated** `apps/storefront/package.json`:

- Added: `"@repo/eslint-config": "workspace:*"` to devDependencies
- Added: `"eslint": "^9"` for ESLint runtime
- Kept: `next`, `react`, `react-dom` in dependencies
- Kept: App-specific devDeps (tailwindcss, types)

## 🎯 Rule Application Map

| Layer | Files | Base Config | React Config | Next Config | Prettier |
|-------|-------|-------------|--------------|------------|----------|
| Root  | All   | Global ignore patterns + prettier config |
| Storefront | `/**/*.ts(x)` | ✅ | ❌ | ✅ (files pattern) | ✅ |
| Admin-Panel | `/**/*.ts(x)` | ✅ | ✅ (files pattern) | ❌ | ✅ |
| Packages/UI | `/**/*.tsx` | ✅ | ✅ (files pattern) | ❌ | ✅ |
| API Server | `/**/*.ts` | ✅ | ❌ | ❌ | ✅ |

## 🛡️ Isolation Guarantees

✅ **No Configuration Leakage**

- Storefront gets ONLY: base + next.js rules (no React rules)
- Admin-Panel gets ONLY: base + react rules (no Next.js rules)
- Root has NO frontend tooling (clean separation)

✅ **Clear Dependency Ownership**

- ESLint tools live in `@repo/eslint-config` package
- Apps declare only what they use via `workspace:*`
- Each app can have independent eslint/typescript versions

✅ **Scalable Architecture**

- New apps use same pattern: reference `@repo/eslint-config`
- New config rules added to package without root changes
- Package updates cascade to all consumers automatically

## 📝 Workspace Resolution

When using `workspace:*` protocol:

```json
"@repo/eslint-config": "workspace:*"
```

This tells the workspace manager to:

1. Use the local package from `packages/eslint-config`
2. Auto-update symlinks on dependency changes
3. Include transitive dependencies (`node_modules` in the package)

## 🔧 Usage Examples

### Adding eslint to an app

```bash
bun add -D @repo/eslint-config workspace:*
```

### Using the config in eslint.config.ts

```ts
import baseConfig from "@repo/eslint-config/base";
import nextConfig from "@repo/eslint-config/next";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...nextConfig[0]
  }
];
```

### Adding app-specific dependencies

```json
{
  "dependencies": {
    "next": "15.0.0",              // Framework
    "react": "19.0.0",             // Core library
    "framer-motion": "^10.0.0"     // App-specific animation lib
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",  // Shared config
    "tailwindcss": "^4"                    // App-specific styling
  }
}
```

## ✨ Benefits

| Benefit | Impact |
|---------|--------|
| **Cleaner Root** | No frontend cruft cluttering orchestration level |
| **Encapsulation** | ESLint logic isolated in dedicated package |
| **No Duplication** | Single source of truth for linting rules |
| **Scalability** | Easy to add new apps with same pattern |
| **Maintainability** | Changes to ESLint config in one place |
| **Type Safety** | Each app manages its own TS version |
| **Clear Boundaries** | Apps only import what they need |
| **Workspace Benefits** | Symlink-based linking via `workspace:*` |
