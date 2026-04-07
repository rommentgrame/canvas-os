import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change 'canvas-os' to your GitHub repository name
const REPO_NAME = 'canvas-os'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
