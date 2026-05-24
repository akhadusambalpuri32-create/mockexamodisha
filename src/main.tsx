import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence benign Vite WebSocket / HMR and proxy connectivity promise rejection errors
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason || '');
  const isWebSocketError = 
    reasonStr.includes('WebSocket') || 
    (event.reason && typeof event.reason === 'object' && ('message' in event.reason) && String(event.reason.message).includes('WebSocket')) ||
    reasonStr.includes('vite') ||
    reasonStr.includes('hmr');

  if (isWebSocketError) {
    console.warn('⚠️ Prevented benign development WebSocket/HMR rejection:', event.reason);
    event.preventDefault();
    event.stopPropagation();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

