import eslintJs from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import { importX } from "eslint-plugin-import-x";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import architecture from "./architecture.ts";

export default defineConfig([
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.js", "**/*.mjs"],
    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: [
            "tsconfig.json",
            "apps/*/tsconfig.json",
            "packages/*/tsconfig.json",
          ],
        },
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "import-x/no-cycle": ["error", { maxDepth: 10, ignoreExternal: true }],
      "import-x/no-unresolved": "error",
    },
  },

  ...architecture,

  // PRETTIER - Must be last to disable conflicting rules
  eslintConfigPrettier,
]);
