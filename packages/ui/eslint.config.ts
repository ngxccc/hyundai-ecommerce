import {
  baseConfig,
  defineConfig,
  globalIgnores,
} from "@nhatnang/eslint-config";

const eslintConfig = defineConfig(
  globalIgnores(["src/components/ui/**"]),

  // BASE CONFIG - Applied to all files in entire monorepo
  ...baseConfig,
);

export default eslintConfig;
