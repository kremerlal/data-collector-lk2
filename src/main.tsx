import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './assets/dhs-brand.css';
import './assets/main.css';
import './assets/content-theme.css';
import App from './App';
import { BrandingProvider } from './branding/BrandingProvider';
import { ColorModeProvider } from './colorMode';
import { queryClient } from './queryClient';
import { StatusProvider } from './StatusProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StatusProvider>
        <BrandingProvider>
          <ColorModeProvider>
            <App />
          </ColorModeProvider>
        </BrandingProvider>
      </StatusProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
