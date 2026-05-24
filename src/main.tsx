import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence benign Vite WebSocket / HMR and proxy connectivity promise rejection errors
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event?.reason || '');
  const isWebSocketError = 
    reasonStr.toLowerCase().includes('websocket') || 
    reasonStr.toLowerCase().includes('vite') || 
    reasonStr.toLowerCase().includes('hmr') ||
    (event?.reason && typeof event.reason === 'object' && ('message' in event.reason) && String(event.reason.message).toLowerCase().includes('websocket'));

  const isFirestoreBenignStreamClose =
    reasonStr.includes('@firebase/firestore') ||
    reasonStr.includes('GrpcConnection') ||
    reasonStr.includes('Disconnecting idle stream') ||
    reasonStr.includes('Timed out waiting for new targets');

  if (isWebSocketError || isFirestoreBenignStreamClose) {
    if (isWebSocketError) {
      console.warn('⚠️ Prevented benign development WebSocket/HMR rejection:', event.reason);
    } else {
      console.info('ℹ️ Managed benign Firestore idle stream disconnection rejection safely.');
    }
    event.preventDefault();
    event.stopPropagation();
  }
});

// Also silence standard window ErrorEvents referencing WebSocket connection issues
window.addEventListener('error', (event) => {
  const errorMsg = String(event?.message || '');
  const isWebsocketError = 
    errorMsg.toLowerCase().includes('websocket') || 
    errorMsg.toLowerCase().includes('vite') ||
    (event?.error && String(event.error?.message || '').toLowerCase().includes('websocket'));

  const isFirestoreBenignStreamClose =
    errorMsg.includes('@firebase/firestore') ||
    errorMsg.includes('GrpcConnection') ||
    errorMsg.includes('Disconnecting idle stream') ||
    errorMsg.includes('Timed out waiting for new targets');

  if (isWebsocketError || isFirestoreBenignStreamClose) {
    if (isWebsocketError) {
      console.warn('⚠️ Suppressed benign window ErrorEvent for WebSocket:', event.message);
    } else {
      console.info('ℹ️ Managed benign Firestore idle stream disconnection error safely.');
    }
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

