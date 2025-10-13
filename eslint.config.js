import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPromise from "eslint-plugin-promise";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
  eslintPluginPrettierRecommended,
  {
    plugins: {
      "react-hooks": eslintPluginReactHooks,
      import: eslintPluginImport,
      promise: eslintPluginPromise,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "promise/always-return": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/catch-or-return": "error",
      "promise/no-native": "off",
      "promise/no-nesting": "warn",
      "promise/no-promise-in-callback": "warn",
      "promise/no-callback-in-promise": "warn",
      "promise/avoid-new": "warn",
      "promise/no-new-statics": "error",
      "promise/no-return-in-finally": "warn",
      "promise/valid-params": "warn",
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];