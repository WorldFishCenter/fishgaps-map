import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        // If you have any path aliases in your CRA app, define them here
        // For example: '@': path.resolve(__dirname, './src'),
      }
    },
    // Configure server options
    server: {
      port: 3000, // Match default CRA port
      open: true, // Open browser on start
    },
    // Handle environment variables
    define: {
      // Pass through all environment variables
      // This allows for backwards compatibility with CRA's process.env approach
      'process.env': {
        ...env,
        // Explicitly add any CRA variables you need
        REACT_APP_MAPBOX_TOKEN: env.REACT_APP_MAPBOX_TOKEN || env.VITE_MAPBOX_TOKEN
      }
    },
    // Testing configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: true
    }
  };
}); 