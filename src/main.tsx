import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onRegistered(r) {
    if (r) {
      console.log('Montra PWA Service Worker successfully registered.');
    }
  },
  onRegisterError(error) {
    console.error('Montra Service Worker registration failed:', error);
  },
});

createRoot(document.getElementById('root')!).render(<App />);
