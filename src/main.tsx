import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/dhs-brand.css';
import './assets/main.css';
import './assets/content-theme.css';
import App from './App';
import { ColorModeProvider } from './colorMode';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  </React.StrictMode>,
);
