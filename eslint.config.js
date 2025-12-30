const js = require('@eslint/js')
const prettier = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    plugins: {
      prettier: prettier
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'off',
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js'
    ]
  }
]
