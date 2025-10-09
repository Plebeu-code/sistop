/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@app': resolve(__dirname, 'src/app'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@domains': resolve(__dirname, 'src/domains'),
      '@mocks': resolve(__dirname, 'src/mocks')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom'
  }
})
