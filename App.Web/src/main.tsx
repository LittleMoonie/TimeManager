import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { OpenAPI } from '@/lib/api';

import App from './pages/App';

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
