import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/app': {
        target: 'https://app.hut1150.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})