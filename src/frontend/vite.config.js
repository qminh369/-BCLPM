import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Trong quá trình dev, proxy /api tới backend để tránh lỗi CORS
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
