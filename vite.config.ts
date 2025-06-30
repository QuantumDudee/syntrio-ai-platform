import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/lingo-api': {
        target: 'https://api.lingo.dev/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lingo-api/, ''),
        secure: true,
      }
    }
  }
});