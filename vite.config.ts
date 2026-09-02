import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

export default defineConfig(() => {
  return {
    appType: 'spa' as const,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'copy-index-to-404',
        writeBundle() {
          const indexPath = path.resolve(__dirname, 'dist/index.html');
          const destPath = path.resolve(__dirname, 'dist/404.html');
          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, destPath);
          }
        },
        closeBundle() {
          const indexPath = path.resolve(__dirname, 'dist/index.html');
          const destPath = path.resolve(__dirname, 'dist/404.html');
          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, destPath);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          privacy: path.resolve(__dirname, 'privacy-policy.html'),
          terms: path.resolve(__dirname, 'terms.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
