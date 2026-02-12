import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        admin: './index.html'
      },
      output: {
        entryFileNames: 'admin-assets/[name]-[hash].js',
        chunkFileNames: 'admin-assets/[name]-[hash].js',
        assetFileNames: 'admin-assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/oauth2': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      },
      '/admin': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      },
      '/public': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
})
