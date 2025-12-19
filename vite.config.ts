import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true, // Expose to network (0.0.0.0)
    port: 3024, // User requested port 3024 for frontend
    proxy: {
      '/api': 'http://localhost:3025' // Proxy to backend (moved to 3025 to avoid conflict)
    }
  }
});