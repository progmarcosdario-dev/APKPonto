import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Registrar service worker para suporte PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/serviceWorker.js')
      .then((registration) => {
        console.log('[App] Service Worker registrado:', registration);
      })
      .catch((error) => {
        console.warn('[App] Falha ao registrar Service Worker:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
