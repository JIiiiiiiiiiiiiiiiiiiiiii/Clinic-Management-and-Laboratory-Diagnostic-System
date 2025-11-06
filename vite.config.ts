import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
        // Minify in production
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
    },
    build: {
        // Production optimizations
        minify: 'esbuild',
        cssMinify: true,
        sourcemap: false, // Disable source maps in production for better performance
        rollupOptions: {
            output: {
                // Code splitting for better caching
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['@inertiajs/react'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
                },
                // Optimize chunk file names
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Target modern browsers for smaller bundles
        target: 'es2015',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react'],
    },
});
