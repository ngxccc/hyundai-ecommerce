import { defineConfig, globalIgnores } from "eslint/config";
import baseConfig from "@nhatnang/eslint-config/base";

const eslintConfig = defineConfig(
  globalIgnores(["dist/**", "build/**", "node_modules/**", "drizzle/**"]),

  // BASE CONFIG - Applied to all files in package
  ...baseConfig,
);

export default eslintConfig;
