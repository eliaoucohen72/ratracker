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
      // Forward all /api/* requests to the local Express server (ratracker-server)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: false,
      },
    },
  },
});