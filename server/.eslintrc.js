module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-console': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': ['error', 'always'],
  },
}; 