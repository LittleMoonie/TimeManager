import { defineConfig, type Plugin } from 'vite';
import path from 'path';

const runtimeConfig = (): Plugin => ({
  name: 'runtime-config',
  configureServer: (server) => {
    server.middlewares.use('/api/config', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ API_SERVER: process.env.API_SERVER }));
    });
  },
});

export default defineConfig({
  plugins: [runtimeConfig()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
