module.exports = {
  root: true,
  extends: '@arcblock/eslint-config/base',
  globals: {
    logger: true,
    cy: true,
    Cypress: true,
  },
  rules: {
    'react/jsx-no-bind': 0,
    'react-hooks/exhaustive-deps': 0,
    'react/require-default-props': [
      'error',
      {
        functions: 'defaultArguments',
      },
    ],
  },
};
