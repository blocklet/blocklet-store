const path = require('path');

module.exports = {
  root: true,
  extends: '@arcblock/eslint-config-ts',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: [path.resolve(__dirname, 'tsconfig.eslint.json'), path.resolve(__dirname, 'tsconfig.json')],
  },
  env: {
    browser: true,
  },
  globals: {
    cy: true,
    Cypress: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'parameter',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        filter: {
          regex: '^_{1,2}$', // 允许 _ 或 __
          match: true,
        },
      },
    ],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_', // 允许不使用的变量可以_开头
        argsIgnorePattern: '^_', // 允许不使用的参数可以_开头
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_', // 允许不使用的变量可以_开头
        argsIgnorePattern: '^_', // 允许不使用的参数可以_开头
      },
    ],
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'no-use-before-define': 'off',
    'react/require-default-props': 'off',
    'react/no-unknown-property': 'off',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          kebabCase: true,
        },
        ignore: ['setupProxy.js'],
      },
    ],
  },
};
