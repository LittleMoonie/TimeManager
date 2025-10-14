import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/app/App';
import { OpenAPI } from '@/lib/api';

const root = createRoot(document.getElementById('root')!);

const renderApp = () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

fetch('/api/config')
  .then((response) => response.json())
  .then((config) => {
    console.log('API Server URL from config:', config.API_SERVER);
    OpenAPI.BASE = config.API_SERVER;
    OpenAPI.WITH_CREDENTIALS = true;
    renderApp();
    return void 0; // Explicitly return void
  })
  .catch((error) => {
    console.error('Could not load configuration:', error);
    // You might want to render an error message here
    return void 0; // Explicitly return void
  });
