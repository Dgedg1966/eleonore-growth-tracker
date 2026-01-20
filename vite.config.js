import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Éléonore Growth Tracker',
        short_name: 'EleonoreTracker',
        description: 'Suivi croissance et nutrition pour Éléonore',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Ajoute une icône si tu veux (upload un PNG dans public/)
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
