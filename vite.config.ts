import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   build: {
    rollupOptions: {
      input: {
        content: 'src/content.ts'
      },
      output: {
        entryFileNames: 'content.js'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
})
