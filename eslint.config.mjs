import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    ignores: ["dist", "node_modules"],
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // Fixed: was "globals: globals.node"
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "readonly",
      },
    },
  },

  {
    files: ["**/*.ts"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },

      globals: {
        ...globals.node, // Add this to include all Node globals
        process: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint,
    },

    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "none",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
        ...globals.node, // Add Node globals for test files too
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },
];
