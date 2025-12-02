// https://docs.expo.dev/guides/using-eslint/
/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'android/*',
      'ios/*',
      'node_modules/*',
      'web-build/*',
      '**/*.d.ts',
    ],
  },
  {
    rules: {
      'react/display-name': 'off',
      'no-unused-vars': 'off',
    },
  },
]);
