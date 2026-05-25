import {
  baseConfig,
  nextConfig,
  defineConfig,
  globalIgnores,
} from "@nhatnang/eslint-config";

const eslintConfig = defineConfig([
  globalIgnores([
    "dist/**",
    "!src/shared/components/ui/**",
    ".source/**",
    "src/types/**",
  ]),

  // BASE CONFIG - Applied to all files in entire monorepo
  ...baseConfig,
  ...nextConfig,
]);

export default eslintConfig;
