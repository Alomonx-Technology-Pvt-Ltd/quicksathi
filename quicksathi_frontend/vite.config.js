import process from 'node:process'
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Split large vendor libraries into separate chunks for parallel loading
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('firebase')) return 'vendor-firebase';
              if (id.includes('framer-motion')) return 'vendor-framer-motion';
              if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-leaflet';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('gsap')) return 'vendor-gsap';
            }
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

