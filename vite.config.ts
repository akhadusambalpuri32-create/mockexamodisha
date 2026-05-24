import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable client HMR loop entirely to stop benign browser websocket connection warnings
      hmr: false,
      // Disable active file-watching during fast-paced developer edits
      watch: null,
    },
  };
});
