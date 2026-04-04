import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 👇 IMPORTANTE para GitHub Pages
  base: '/SistemaEntrenamiento/',

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // No agregar .css, .tsx, .ts aquí
  assetsInclude: ['**/*.svg', '**/*.csv'],
})