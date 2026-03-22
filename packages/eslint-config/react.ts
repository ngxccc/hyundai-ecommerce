import eslintReact from "@eslint-react/eslint-plugin";
import globals from "globals";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...eslintReact.configs["recommended-type-checked"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
