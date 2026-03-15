import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Apply persisted theme before first render to avoid flash
try {
  const stored = JSON.parse(localStorage.getItem('ct-app') || '{}');
  const theme = stored?.state?.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
} catch {
  document.documentElement.setAttribute('data-theme', 'dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
