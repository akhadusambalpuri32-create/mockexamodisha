import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable client HMR and websockets loop entirely to stop benign browser websocket connection warnings in production
      hmr: isProd ? false : undefined,
      // Disable active file-watching during fast-paced developer edits
      watch: isProd ? null : undefined,
    },
  };
});
