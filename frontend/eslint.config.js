// eslint.config.js
// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  // ─── Global ignores ───────────────────────────────────────────
  {
    ignores: ['node_modules/**', 'dist/**', '**/*.d.ts']
  },

  // ─── Base ESLint ──────────────────────────────────────────────
  eslint.configs.recommended,

  // ─── React (flat native config, React 17+ JSX transform) ──────
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat['jsx-runtime'], // React 19 - import React gereksiz
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser
      }
    },
    settings: {
      react: { version: 'detect' }
    }
  },

  // ─── React Hooks (flat native config) ─────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactHooksPlugin.configs.flat.recommended,
    rules: {
      ...reactHooksPlugin.configs.flat.recommended.rules
      //'react-hooks/exhaustive-deps': 'off' // senin tercihin
    }
  },

  // ─── TypeScript ───────────────────────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true, // tsconfig.json'u otomatik bulur
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true }
      },
      globals: { ...globals.browser }
    },
    rules: {
      // ── Genel ──
      'no-undef': 'off', // TypeScript zaten handle ediyor

      // // ── TypeScript ──
      // '@typescript-eslint/no-unused-vars': 'error',
      // '@typescript-eslint/no-explicit-any': 'error',
      // '@typescript-eslint/no-unsafe-assignment': 'error',
      // '@typescript-eslint/no-unsafe-call': 'error',
      // '@typescript-eslint/no-unsafe-member-access': 'error',
      // '@typescript-eslint/no-floating-promises': 'off',
      // '@typescript-eslint/no-misused-promises': 'off',
      // '@typescript-eslint/no-redundant-type-constituents': 'off',

      // ── Karmaşıklık / Temiz Kod ──
      complexity: ['error', 50],
      'max-depth': ['error', 4],
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }]
    }
  },

  // ─── Prettier ─────────────────────────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    ...prettierRecommended,
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }]
    }
  },

  // ─── JS config dosyaları (webpack.config.js vb.) ──────────────
  {
    files: ['*.js', '*.cjs'],
    extends: [tseslint.configs.disableTypeChecked], // type-aware kuralları kapat
    languageOptions: {
      globals: { ...globals.node }
    }
  },

  // ─── Test dosyaları ───────────────────────────────────────────
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.jest }
    }
  }
]);
