import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standard Vite config for a React app.
// Dev server runs on port 5173 (matches the backend's @CrossOrigin).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
