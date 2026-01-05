import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: {
        overlay: true,
      },
    },
    css: {
      postcss: './postcss.config.mjs',
    },
    plugins: [react()],
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || ''),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    build: {
      rollupOptions: {
        output: {
<<<<<<< HEAD
          manualChunks: (id) => {
            // React core
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            
            // UI libraries
            if (id.includes('node_modules/lucide-react')) {
              return 'ui-vendor';
            }
            
            // Radix UI components (large library, split for better caching)
            if (id.includes('node_modules/@radix-ui')) {
              return 'radix-vendor';
            }
            
            // Supabase client
            if (id.includes('node_modules/@supabase')) {
              return 'supabase-vendor';
            }
            
            // i18n libraries
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
              return 'i18n-vendor';
            }
            
            // Form libraries
            if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod')) {
              return 'form-vendor';
            }
            
            // AI/ML libraries (large, lazy-loaded)
            if (id.includes('node_modules/@ai-sdk') || id.includes('node_modules/@google/generative-ai') || id.includes('node_modules/ai')) {
              return 'ai-vendor';
            }
            
            // Charts (large, lazy-loaded)
            if (id.includes('node_modules/recharts')) {
              return 'charts-vendor';
            }
            
            // Other large vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor';
            }
=======
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['lucide-react'],
>>>>>>> d990df020acf2dbd0fd0e3232e7fc73bebed2318
          }
        }
      }
    },
    publicDir: 'public',
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          'src/vite-env.d.ts',
        ],
      },
    },
  };
});
