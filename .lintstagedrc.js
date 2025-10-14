module.exports = {
  // Lint and format TypeScript and JavaScript files in App.API and App.Web, excluding build directories
  'App.{API,Web}/**/!(build)/**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  // Format other files in App.API and App.Web
  'App.{API,Web}/**/*.{json,md,yml,yaml}': ['prettier --write'],
  // Exclude root-level configuration files from linting/formatting
  '!{.prettierrc.json,package.json,yarn.lock,eslint.config.js,.lintstagedrc.js,commitlint.config.cjs}':
    [
      // No actions for these files, they are explicitly skipped
    ],
};
