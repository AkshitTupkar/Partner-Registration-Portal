// Mirrors atlas-frontend's ESLint setup: recommended JS + TypeScript rules,
// React hooks (exhaustive deps are errors) and Vite fast-refresh boundaries.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", "src/vendor"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // Endpoint calls live in src/services/, so components never build URLs or
      // payloads themselves. ApiError may be imported anywhere (for instanceof).
      "no-restricted-imports": ["error", {
        paths: [{
          name: "@/lib/api",
          importNames: ["request", "postJson"],
          message: "Call the API through a function in src/services/ instead.",
        }],
      }],
    },
  },
  {
    // The services layer is the sanctioned caller of the raw client.
    files: ["src/services/**"],
    rules: { "no-restricted-imports": "off" },
  },
]);
