import { baseConfig, nextConfig, defineConfig } from "@nhatnang/eslint-config";

const eslintConfig = defineConfig(
  // BASE CONFIG - Applied to all files in entire monorepo
  ...baseConfig,
  ...nextConfig,
);

export default eslintConfig;
