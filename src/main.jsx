// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

// Suppress benign Vite websocket errors in dev
if (typeof window !== 'undefined') {
  const isViteMsg = (msg) =>
    msg.includes('[vite]') || msg.includes('WebSocket') || msg.includes('connection to websocket');

  const _origError = console.error;
  console.error = (...args) => {
    if (isViteMsg(args[0]?.toString() || '')) return;
    _origError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (e) => {
    if (isViteMsg(e.reason?.message || e.reason?.toString() || '')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  window.addEventListener('error', (e) => {
    if (isViteMsg(e.message || '')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      GoogleOAuthProvider must wrap the entire app so useGoogleLogin()
      is available in any component (GoogleButton, etc.)
    */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);