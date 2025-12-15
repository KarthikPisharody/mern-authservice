import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist", "node_modules"],
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
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
      // Turn off base rule
      "no-unused-vars": "off",
      
      // Use TypeScript-specific rule with proper config
      "@typescript-eslint/no-unused-vars": ["error", {
         "args": "none", 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrors": "all",
        "ignoreRestSiblings": true
      }],
    },
  },

  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
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