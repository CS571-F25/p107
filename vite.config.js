import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr({ exportAsDefault: true }), react()],
  base: '/p107/', // Change this to your repo name when deploying to GitHub Pages
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router'],
          'vendor-bootstrap': ['react-bootstrap', 'bootstrap'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-utils': ['date-fns'],
          
          // App modules
          'auth': [
            './src/components/auth/AuthProvider.jsx',
            './src/components/auth/Login.jsx',
            './src/components/auth/Register.jsx',
            './src/components/auth/Logout.jsx',
            './src/components/auth/ForgotPassword.jsx'
          ],
          'blog': [
            './src/components/blog/BlogCard.jsx',
            './src/components/blog/BlogPost.jsx',
            './src/components/blog/AuthorCard.jsx'
          ],
          'passport': [
            './src/components/passport/PassportMap.jsx'
          ]
        }
      }
    }
  }
})
