import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/.expo/**"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },
  {
    files: ["apps/mobile/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    // No user data in logs (docs/architecture/security.md): console output is not allowed.
    files: [
      "apps/mobile/src/**/*.{ts,tsx}",
      "apps/mobile/app/**/*.tsx",
      "packages/core/src/**/*.ts",
    ],
    ignores: ["**/*.test.{ts,tsx}", "**/test/**"],
    rules: { "no-console": "error" },
  },
  {
    // Layering (docs/architecture/overview.md): the design system never reaches into
    // app state or persistence, and the domain package never imports the app.
    files: ["apps/mobile/src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/state/**", "**/data/**", "**/features/**"],
              message: "ui must stay presentational.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-native", "expo*", "@free/mobile"],
              message: "core must stay platform-free.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.mjs", "**/*.js", "**/*.config.ts"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    // CommonJS config files executed by Node (e.g. Jest globalSetup).
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { module: "writable", process: "readonly" },
    },
  },
);
