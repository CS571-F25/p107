import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/p107/', // Change this to your repo name when deploying to GitHub Pages
  build: {
    outDir: 'docs'
  }
})
