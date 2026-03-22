import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import baseConfig from "@repo/eslint-config/base";
import reactConfig from "@repo/eslint-config/react";
import nextConfig from "@repo/eslint-config/next";

const eslintConfig = defineConfig(
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/dist/**",
    "**/build/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/.cache/**",
    "**/public/shared/**"
  ]),

  // BASE CONFIG - Applied to all files in entire monorepo
  ...baseConfig,

  // REACT CONFIG - Only for admin-panel and packages/ui (NOT storefront)
  {
    files: ["apps/admin-panel/**/*.ts", "apps/admin-panel/**/*.tsx", "packages/ui/**/*.tsx"],
    ...reactConfig[0],
  },

  // NEXT.JS CONFIG - Only for storefront
  {
    files: ["apps/storefront/**/*.ts", "apps/storefront/**/*.tsx"],
    ...nextConfig[0],
  },

  // PRETTIER - Must be last to disable conflicting rules
  eslintConfigPrettier
);

export default eslintConfig;
