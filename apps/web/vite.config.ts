import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const base =
    env.VITE_BASE_PATH || (mode === 'production' ? '/Kinera/' : '/');

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', '404.html'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,wasm,json}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          cleanupOutdatedCaches: true,
        },
        manifest: {
          name: 'KINERA — Automotive Powertrain & Vehicle Dynamics Explorer',
          short_name: 'KINERA',
          description:
            'Explore the Mechanics. Understand the Motion. Interactive 3D automotive powertrain and vehicle dynamics engineering laboratory.',
          theme_color: '#0E1116',
          background_color: '#0E1116',
          display: 'standalone',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    worker: {
      format: 'es',
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three', '@react-three/fiber', '@react-three/drei'],
            react: ['react', 'react-dom', 'react-router-dom', 'zustand'],
            katex: ['katex'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
