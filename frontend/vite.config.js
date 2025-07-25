import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    'global':'globalThis',
    'process.env': {},
    }, build:{
      target: 'esnext',
    },
    resolve: {
  alias: {
    crypto: 'crypto-browserify',
    stream: 'stream-browserify',
    buffer: 'buffer',
    process: 'process/browser'
  }
}
})
