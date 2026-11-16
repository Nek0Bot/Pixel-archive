import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

// Versi aplikasi diambil dari package.json (satu sumber kebenaran)
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [ ... 
    react(),
    VitePWA({
      // Service worker ditulis manual di src/sw.js (Modul 4); plugin hanya membuat manifest
      // dan menyuntikkan daftar file build ke self.__WB_MANIFEST.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: false,
      injectManifest: { globPatterns: ['**/*.{js,css,html,png,svg,ico}'] },
      manifest: {
        name: 'Pixel Archive',
        short_name: 'Pixel Archive',
        description: 'Katalog game oleh para gamer',
        theme_color: '#1B1F3B',
        background_color: '#EEF0F6',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ]
})
