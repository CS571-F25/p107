import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr({ exportAsDefault: true }), react()],
  base: '/p107/', // Change this to your repo name when deploying to GitHub Pages
  build: {
    outDir: 'docs'
  }
})
