import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "apps/web/.next/**",
      "apps/web/next-env.d.ts",
      // Ignore utility and script files that don't need strict linting
      "scripts/**/*.js",
      "lib/**/*.js",
      "utils/**/*.js",
      "tools/**/*.js",
      "agents/**/*.js",
      "test-*.js",
      "comprehensive-*.js",
      "fix-*.js",
      "manual-*.js",
      "add-*.js",
      "*.spec.js",
      "*.test.js",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Relax some rules for the main application code
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      // Allow require() in .js files
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
