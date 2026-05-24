import {
  baseConfig,
  nextConfig,
  defineConfig,
  globalIgnores,
} from "@nhatnang/eslint-config";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    // "dist/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    // "src/shared/components/ui/**",
    ".source/**",
  ]),

  // BASE CONFIG - Applied to all files in entire monorepo
  ...baseConfig,
  ...nextConfig,
]);

export default eslintConfig;
