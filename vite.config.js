// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://skripsi-api-995782183824.asia-southeast2.run.app/api/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});