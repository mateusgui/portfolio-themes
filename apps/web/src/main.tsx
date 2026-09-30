import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.tsx';
import './fonts.ts';
import './i18n/index.ts';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento #root não encontrado no index.html');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
