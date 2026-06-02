import {
  baseConfig,
  defineConfig,
  globalIgnores,
} from "@nhatnang/eslint-config";

const eslintConfig = defineConfig(
  globalIgnores(["src/components/ui/**", "src/components/reui/**"]),

  // BASE CONFIG - Applied to all files in entire monorepo
  ...baseConfig,
);

export default eslintConfig;
