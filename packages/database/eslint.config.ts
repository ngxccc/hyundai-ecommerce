import {
  baseConfig,
  defineConfig,
  globalIgnores,
} from "@nhatnang/eslint-config";

const eslintConfig = defineConfig(
  globalIgnores(["dist/**", "build/**", "node_modules/**", "drizzle/**"]),

  // BASE CONFIG - Applied to all files in package
  ...baseConfig,
);

export default eslintConfig;
