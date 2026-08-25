import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],

    // ── Output ──
    build: {
      outDir: 'dist',
      sourcemap: false, // disable in production to reduce bundle size
      rollupOptions: {
        output: {
          // Split large vendor libraries into separate chunks for parallel loading
          manualChunks: {
            firebase: ['firebase/app', 'firebase/auth'],
            'framer-motion': ['framer-motion'],
            gsap: ['gsap'],
          },
        },
      },
    },

    // ── Dev Server Proxy ──
    // Forwards /api/* requests to the local backend during development.
    // This avoids CORS issues on the Vite dev server.
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL
            ? env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

