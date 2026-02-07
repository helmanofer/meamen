import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['node_modules', 'client', 'dist', '.venv', '*.js']),
  {
    files: ['server/**/*.ts', 'start.ts', 'prisma/seed.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        Bun: 'readonly',
      },
    },
  },
])
