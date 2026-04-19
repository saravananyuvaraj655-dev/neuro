import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: "/",   // ✅ IMPORTANT

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      workbox: {
        navigateFallback: '/index.html'  // ✅ FIX BLANK SCREEN
      },

      manifest: {
        name: 'NeuroTrack',
        short_name: 'NeuroTrack',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})