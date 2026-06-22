import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH — set to '/supply-chain-dashboard/' when deploying to GitHub Pages.
// Defaults to '/' for local development.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  server: {
    port: 5173,
    host: true,
  },
});
