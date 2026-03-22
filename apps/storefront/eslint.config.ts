import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import baseConfig from "@repo/eslint-config/base";
import nextConfig from "@repo/eslint-config/next";

const eslintConfig = defineConfig(
  globalIgnores([
    ".next/**",
    "out/**",
    "dist/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),

  // BASE CONFIG - Applied to all files in entire monorepo
  ...baseConfig,
  ...nextConfig,

  // PRETTIER - Must be last to disable conflicting rules
  eslintConfigPrettier
);

export default eslintConfig;
