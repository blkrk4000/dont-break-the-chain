import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative Pfade: läuft auf GitHub Pages (Unterpfad) und lokal
  base: './',
  plugins: [react()],
  server: {
    port: 5200,
    strictPort: true,
  }
});