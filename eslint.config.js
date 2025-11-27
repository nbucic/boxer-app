/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'android/**'],
  },
  {
    rules: {
      'react/display-name': 'off',
      'no-unused-vars': 'off',
    },
  },
]);
