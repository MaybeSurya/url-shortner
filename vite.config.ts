import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function inlineCss(): Plugin {
  return {
    name: 'inline-css-plugin',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const cssAssets = Object.keys(bundle).filter((name) => name.endsWith('.css'));
      let combinedCss = '';
      for (const name of cssAssets) {
        const asset = bundle[name];
        if (asset && asset.type === 'asset' && typeof asset.source === 'string') {
          combinedCss += asset.source;
        }
      }

      const htmlAsset = bundle['index.html'];
      if (htmlAsset && htmlAsset.type === 'asset' && typeof htmlAsset.source === 'string') {
        let html = htmlAsset.source;
        // Remove render-blocking stylesheet link
        html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*\/?>/gi, '');
        // Inline CSS into <style> in <head> for zero-latency 0ms render-blocking paint
        html = html.replace('</head>', `<style id="app-styles">${combinedCss}</style></head>`);
        htmlAsset.source = html;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), inlineCss()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'esnext',
    assetsInlineLimit: 4096,
    cssCodeSplit: false, // combine CSS into single optimized bundle to inline
    reportCompressedSize: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-query';
            }
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
