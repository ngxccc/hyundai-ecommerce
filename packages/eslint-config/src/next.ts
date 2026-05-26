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
    rules: {
      "@next/next/no-img-element": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.name='Image']:not(:has(JSXAttribute[name.name='width'])):not(:has(JSXAttribute[name.name='fill']))",
          message: "The <Image> component from next/image must have either a 'width' or 'fill' attribute.",
        },
        {
          selector:
            "JSXOpeningElement[name.name='Image']:not(:has(JSXAttribute[name.name='height'])):not(:has(JSXAttribute[name.name='fill']))",
          message: "The <Image> component from next/image must have either a 'height' or 'fill' attribute.",
        },
        {
          selector:
            "JSXOpeningElement[name.name='Image']:has(JSXAttribute[name.name='fill']):not(:has(JSXAttribute[name.name='sizes']))",
          message: "The <Image> component from next/image with 'fill' must have a 'sizes' attribute for performance.",
        },
      ],
    },
  },
]);
