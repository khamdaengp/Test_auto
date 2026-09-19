import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    proxy: {
      // Only proxy backend API calls that begin with /api/ (e.g., /api/projects, /api/suites)
      // Do NOT proxy frontend client-side SPA routes like /api-integration
      '^/api/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/artifacts': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') return;
            console.error('[vite] ws proxy error:', err);
          });
        },
      },
    },
  },
});
