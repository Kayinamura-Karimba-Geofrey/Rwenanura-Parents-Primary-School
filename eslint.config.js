import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'public/'] },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    // Frontend (bundled by Vite, runs in the browser)
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    // API server, tests and tooling (Node.js)
    files: ['server/**/*.js', 'tests/**/*.js', 'scripts/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
];
