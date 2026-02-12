import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { renameSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rename-index-to-admin',
      closeBundle() {
        const indexPath = resolve(__dirname, 'dist/index.html')
        const adminPath = resolve(__dirname, 'dist/admin.html')
        try {
          renameSync(indexPath, adminPath)
          console.log('✓ Renamed index.html to admin.html')
        } catch (err) {
          console.error('Failed to rename index.html:', err)
        }
      }
    }
  ],
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
