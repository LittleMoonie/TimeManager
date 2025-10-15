/**
 * 🧱 GoGoTime — lint-staged configuration
 * Works with ESLint Flat Config (v9+) + Prettier
 * Compatible with Yarn 4 / PnP and Husky pre-commit
 */

module.exports = {
  // 🧩 Lint + format JS/TS files in both frontend & backend
  'App.{API,Web}/**/*.{ts,tsx,js,jsx}': [
    // Run ESLint without deprecated flags
    'eslint --fix --no-warn-ignored --max-warnings=0',

    // Run Prettier (respects .prettierignore automatically)
    'prettier --write',
  ],

  // 🧾 Format non-code files (JSON, Markdown, YAML)
  '**/*.{json,md,yml,yaml}': ['prettier --write'],

  // 🚫 Explicitly skip root-level infra/config files
  '!{.prettierrc.json,package.json,yarn.lock,eslint.config.js,.lintstagedrc.js,commitlint.config.cjs}': [],
};
