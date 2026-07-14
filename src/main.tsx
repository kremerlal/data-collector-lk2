import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/dhs-brand.css';
import './assets/main.css';
import './assets/content-theme.css';
import App from './App';
import { ColorModeProvider } from './colorMode';
import { StatusProvider } from './StatusProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StatusProvider>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </StatusProvider>
  </React.StrictMode>,
);
