import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks — cached across deploys, loaded in parallel.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router', 'react-router-dom'],
          motion: ['motion'],
          state: ['@reduxjs/toolkit', 'react-redux', 'axios'],
        },
      },
    },
  },
})
