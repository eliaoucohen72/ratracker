import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Any request to /api/oref/* is forwarded to the real Pikud Ha'Oref API
      // The browser talks to localhost → no CORS issue
      '/api/oref': {
        target: 'https://www.oref.org.il',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/oref/, ''),
        headers: {
          'Referer': 'https://www.oref.org.il/',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    },
  },
});