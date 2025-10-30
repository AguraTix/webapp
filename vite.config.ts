import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Remove console statements in production
    minify: 'terser',
    // Ignore TypeScript errors during build
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress TypeScript warnings during build
        if (warning.code === 'PLUGIN_WARNING') return
        warn(warning)
      }
    }
  },
  esbuild: {
    // Remove console statements in development for cleaner output
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Ignore TypeScript errors during development
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
