module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  arrowParens: 'always',
  overrides: [
    {
      files: '*.js',
      options: {
        trailingComma: 'es5',
      },
    },
  ],
};
