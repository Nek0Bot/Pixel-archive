import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Arsip Piksel',
        short_name: 'Arsip Piksel',
        description: 'Katalog game indie dan retro',
        theme_color: '#1B1F3B',
        background_color: '#EEF0F6',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: { navigateFallbackDenylist: [/^\/api/] }
    })
  ],
  server: { proxy: { '/api': 'http://localhost:3001' } }
})
