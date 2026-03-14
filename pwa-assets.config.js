import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      padding: 0.15,
      resizeOptions: { background: '#0d0800' }
    },
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { background: '#0d0800' }
    },
    favicon: {
      sizes: [64, 48, 32, 16],
      padding: 0.05
    },
    transparent: {
      sizes: [64, 192, 512],
      padding: 0.05
    }
  },
  images: ['public/icon.png']
})
