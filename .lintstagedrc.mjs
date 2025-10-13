export default {
  'App.{API,Web}/**/*.{ts,tsx,js,jsx,json,css,scss,md,yml,yaml}': [
    'yarn dlx prettier --write',
  ],
  'App.{API,Web}/**/*.{ts,tsx,js,jsx}': ['yarn dlx eslint --fix'],

  // Ignore monorepo configs
  '!package.json': 'echo "🟡 skipped root package.json"',
  '!.prettierrc*': 'echo "🟡 skipped prettier config"',
  '!yarn.lock': 'echo "🟡 skipped yarn.lock"'
};
