import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.tsx';
import './fonts.css';
import './i18n/index.ts';
import './index.css';
import { readAppliedTheme } from './themes/appliedTheme.ts';
import { loadThemeSlots } from './themes/loadThemeSlots.ts';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento #root não encontrado no index.html');
}

// Os slots do tema ativo chegam antes do primeiro render: a página já nasce
// com o tema completo (sem trocar o item da sidebar depois de pintar).
void loadThemeSlots(readAppliedTheme()).then(() => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
