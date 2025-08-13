import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    globalSetup: ['./tests/fixtures/global-setup.ts'],
    testTimeout: 60000, // 60 segundos para dar tempo das operações
    hookTimeout: 60000, // 60 segundos para beforeAll/afterAll
    sequence: {
      concurrent: false // Evita concorrência que pode causar problemas no DB
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})