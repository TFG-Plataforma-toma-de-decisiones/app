import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Usar polling es necesario para que funcione el HMR en Docker sobre Windows
      usePolling: true,
    }
  }
});
