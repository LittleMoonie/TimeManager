// 🧱 GoGoTime — Flat ESLint Config (for ESLint v9+)
// Supports TypeScript, React 18+, Promises, Prettier, and Import order

import { fixupConfigRules } from '@eslint/compat';
import pluginJs from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginPromise from 'eslint-plugin-promise';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  // 🧹 Ignore build artifacts, dependencies, coverage, and generated code
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/App.Web/src/lib/api/**', // ignore generated clients
      '**/*.config.*',              // ignore config scripts
    ],
  },

  // 📂 Apply to all JS/TS/React files
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },

  // 🌐 Global language setup
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },

  // 🧩 Base + TypeScript + React + Prettier integrations
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
  eslintPluginPrettierRecommended,

  // 🎯 Custom rules
  {
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      import: eslintPluginImport,
      promise: eslintPluginPromise,
    },

    rules: {
      // --- React ---
      ...eslintPluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',

      // --- Import order & grouping ---
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // --- Promise hygiene ---
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-native': 'off',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/avoid-new': 'warn',
      'promise/no-new-statics': 'error',
      'promise/no-return-in-finally': 'warn',
      'promise/valid-params': 'warn',

      // --- Style ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off', // handled by TS
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ⚛️ React settings
  {
    settings: {
      react: { version: '19.0' },
    },
  },
];
