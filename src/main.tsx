import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppProvider } from './context/AppContext';
import { registerSW } from 'virtual:pwa-register';

// Реєстрація Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Доступне оновлення. Перезавантажити?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Застосунок готовий до роботи офлайн');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
