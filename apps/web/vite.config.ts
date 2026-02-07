import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const PROD_CSP_IMG_SRC = "'self' data: https:"
const DEV_CSP_IMG_SRC = "'self' data: https: http://localhost:9000 http://127.0.0.1:9000"

export default defineConfig(({ command }) => ({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    {
      name: 'inject-csp-img-src',
      transformIndexHtml(html) {
        const imgSrc = command === 'serve' ? DEV_CSP_IMG_SRC : PROD_CSP_IMG_SRC
        return html.replaceAll('__CSP_IMG_SRC__', imgSrc)
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))
