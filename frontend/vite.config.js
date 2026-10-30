import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages repo name — adjust if your repo URL changes
const REPO_NAME = '/A7_ESIOT/';

export default defineConfig({
  plugins: [react()],
  // Use repo subdirectory as base for GitHub Pages; '' for local/Vercel
  base: process.env.GITHUB_ACTIONS ? REPO_NAME : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
});
