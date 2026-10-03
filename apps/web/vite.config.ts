import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  root: ROOT,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': ROOT,
    },
  },
  build: {
    outDir: path.join(ROOT, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 5173,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));