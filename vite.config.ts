import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import Pages from 'vite-plugin-pages';
import path from 'path';
import { fileURLToPath } from 'url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    Pages({
      dirs: 'src/pages'
    }),
    nodePolyfills({
      include: ['events', 'util', 'timers'],
      globals: { process: true, Buffer: true }
    })
  ],
  optimizeDeps: {
    include: ['node-schedule']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
