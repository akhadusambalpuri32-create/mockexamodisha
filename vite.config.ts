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
      // Disable client HMR and websockets loop entirely to stop browser websocket connection warnings
      hmr: false,
      // Disable active file-watching during developer edits
      watch: null,
    },
  };
});
