import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'icons/*.png'],
    manifest: {
      name: 'IBD Navigator',
      short_name: 'IBD Nav',
      description: 'Find toilets, pharmacies and IBD-friendly restaurants near you in Ireland.',
      theme_color: '#6c3fc5',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'any',
      start_url: '/',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      // Cache OSM map tiles for offline use
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'osm-tiles',
            expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Cache Overpass API responses for 5 minutes
          urlPattern: /^https:\/\/(overpass-api\.de|overpass\.private\.coffee|maps\.mail\.ru)\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'overpass-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
  }), cloudflare()],
})