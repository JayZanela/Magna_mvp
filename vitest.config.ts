import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 15000, // 15 segundos para dar tempo das operações
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})