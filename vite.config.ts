import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/rss': {
        target: 'https://letterboxd.com',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const username = url.searchParams.get('username');
          return `/${username}/rss/`;
        },
      },
    },
  },
})
