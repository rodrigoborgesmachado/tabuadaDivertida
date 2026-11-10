import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['build', 'node_modules', 'android'] },
  {
    files: ['**/*.{ts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      parser: tseslint.parser,
      globals: { ...globals.browser, ...globals.vitest },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      '@typescript-eslint/no-redeclare': 'warn',
      '@typescript-eslint/no-use-before-define': ['warn', { functions: false, classes: false, variables: false, typedefs: false }],
      'no-debugger': 'warn',
      'no-dupe-keys': 'warn',
      'no-duplicate-case': 'warn',
      'no-unreachable': 'warn',
      'eqeqeq': ['warn', 'smart'],
    },
  },
);
