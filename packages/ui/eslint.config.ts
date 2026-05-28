import { baseConfig, defineConfig } from "@nhatnang/eslint-config";

const eslintConfig = defineConfig(
  // BASE CONFIG - Applied to all files in entire monorepo
  ...baseConfig,
);

export default eslintConfig;
