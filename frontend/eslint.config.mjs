import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

/** @type {import("eslint").FlatConfig[]} */
const eslintConfig = [
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**"
    ],
    rules: {
      "import/no-anonymous-default-export": "warn",
      "@next/next/no-assign-module-variable": "error",
      "react/no-unescaped-entities": "warn"
    },
  },
];

export default eslintConfig;
