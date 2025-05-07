// frontend/eslint.config.js
import tsParser from '@typescript-eslint/parser';
import angularPlugin from '@angular-eslint/eslint-plugin';
import angularTemplateParser from '@angular-eslint/template-parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,                // ← aqui usamos o módulo importado
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@angular-eslint': angularPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component'] }],
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,   // ← idem para o parser de templates
    },
    rules: {
      // regras de template opcional
    },
  },
  prettierConfig,
];
