import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icon.png',
        'pwa-64x64.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
        'apple-touch-icon-180x180.png'
      ],
      manifest: {
        id: '/',
        name: 'TAMGHA - Bozkır Yazıcısı',
        short_name: 'TAMGHA',
        description: 'Göktürk alfabesini keşfet, tamgaları topla ve bozkırın yazıcısı ol!',
        theme_color: '#0d0800',
        background_color: '#0d0800',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/?source=pwa',
        lang: 'tr',
        dir: 'ltr',
        categories: ['education', 'games'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/mobile-home.png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Ana Ekran - Bölge Seçimi'
          },
          {
            src: 'screenshots/mobile-quiz.png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Quiz Ekranı'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,mp3,woff2}'],
        globIgnores: ['**/*.docx', '**/umay.png', '**/*.svg', '**/screenshots/**'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
