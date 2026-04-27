const path = require('path');

module.exports = {
  root: true,
  extends: '@arcblock/eslint-config-ts',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: [path.resolve(__dirname, 'tsconfig.eslint.json'), path.resolve(__dirname, 'tsconfig.json')],
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
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_', // 忽略以 _ 开头的变量
        argsIgnorePattern: '^_', // 忽略以 _ 开头的参数
      },
    ],
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'no-use-before-define': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/no-unknown-property': 'off',
    'react/require-default-props': [
      'error',
      {
        functions: 'defaultArguments',
      },
    ],
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
