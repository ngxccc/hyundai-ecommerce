import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "dist/**",
    "build/**",
    "next-env.d.ts",
    "src/shared/components/ui/**",
  ]),

  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [nextVitals, nextTs],
  },
]);
