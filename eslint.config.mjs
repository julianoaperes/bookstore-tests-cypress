import js from "@eslint/js";
import globals from "globals";
import cypress from "eslint-plugin-cypress";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/**",
      "bookstore-app/**",
      "cypress/screenshots/**",
      "cypress/videos/**",
      "cypress/results/**",
      "allure-results/**",
      "allure-report/**",
      "coverage/**",
    ],
  },

  // Apply recommended JavaScript checks.
  js.configs.recommended,

  // Configuration files and database tasks execute in Node.js.
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
  },

  // Test code, Page Objects, and API helpers use Cypress globals.
  {
    files: ["cypress/**/*.js", "pages/**/*.js", "api/**/*.js", "utils/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.mocha,
        cy: "readonly",
        Cypress: "readonly",
        expect: "readonly",
        assert: "readonly",
      },
    },
    plugins: {
      cypress,
    },
    rules: {
      ...cypress.configs.recommended.rules,

      // Allow intentionally unused arguments prefixed with "_".
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Disable ESLint formatting rules that conflict with Prettier.
  prettier,
];
