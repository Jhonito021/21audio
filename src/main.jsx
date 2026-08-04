import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Global listener for PWA install prompt
window.deferredPWAInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPWAInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

// Register PWA Service Worker
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((reg) => {
        console.log('21Audio PWA ServiceWorker (service-worker.js) enregistré avec succès, scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('Erreur enregistrement 21Audio ServiceWorker:', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
