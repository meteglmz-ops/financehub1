import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n/i18n';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { initializeMockData } from './utils/mockData';

initializeMockData();

// Robust Global Error Handler for React
window.addEventListener('error', (e) => {
  if (e.message === 'Script error.' || e.message?.includes('Script error')) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return true;
  }
}, true);

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && (e.reason.message === 'Script error.' || e.reason.message?.includes('Script error'))) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PrivacyProvider>
          <App />
        </PrivacyProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);