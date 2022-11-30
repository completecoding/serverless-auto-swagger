module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'prettier', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint', 'deprecation'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  rules: {
    // 0 = off; 1 = warning; 2 = error
    'no-unused-vars': 0, // For Typescript, this has to be handled with the TS plugin instead (automatically)
    'no-console': 0,
    'no-restricted-syntax': 0,
    'no-undef': 1,
    'no-extra-boolean-cast': 1,
    '@typescript-eslint/no-non-null-assertion': 0,
    indent: 0,
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    'deprecation/deprecation': 1,
    '@typescript-eslint/no-explicit-any': 0, // Ideally we want this on, but we have some types that I'm unfamiliar with typed as `any`.
  },
  overrides: [
    {
      files: ['*.spec.ts'],
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-empty-function': 0,
      },
    },
  ],
};
