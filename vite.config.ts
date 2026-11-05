/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'app' && {
      name: 'remover-adsense',
      transformIndexHtml: (html: string) => html.replace(/\s*<script[^>]*adsbygoogle[^>]*><\/script>/, ''),
    },
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: mode === 'app' ? 'build-app' : 'build',
    chunkSizeWarningLimit: 1024,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    mockReset: true,
  },
}));
