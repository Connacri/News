import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.VITE_PORT) || 5173;

export default defineConfig(() => ({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
    },
  },
  server: {
    host,
    port,
    strictPort: false,
    allowedHosts: true as const,
    hmr: false,
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  preview: {
    host,
    port,
    strictPort: true,
    allowedHosts: true as const,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
}));