import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Suppress benign Vite websocket errors
if (typeof window !== 'undefined') {
  const isViteErrorMessage = (msg) =>
    msg.includes('[vite]') ||
    msg.includes('WebSocket') ||
    msg.includes('connection to websocket');

  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (isViteErrorMessage(message)) return;
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason?.toString() || '';
    if (isViteErrorMessage(message)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener(
    'error',
    (event) => {
      const message = event.message || '';
      if (isViteErrorMessage(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);