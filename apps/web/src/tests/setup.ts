import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach } from 'vitest';

import i18n from '../i18n/index.ts';
import { loadThemeSlots } from '../themes/loadThemeSlots.ts';
import { THEME_IDS } from '../themes/registry.ts';

import { MockIntersectionObserver } from './intersectionObserver.ts';

// No app, os slots de cada tema chegam em chunks sob demanda; nos testes, já
// estão todos carregados para que a troca de tema seja síncrona.
beforeAll(async () => {
  await Promise.all(THEME_IDS.map(loadThemeSlots));
});

// Os testes de componente usam os textos em pt-BR; cada teste começa sem escolha salva.
beforeEach(async () => {
  // A navegação grava o hash (`#projetos`): sem limpar, o próximo teste nasceria nessa seção.
  history.replaceState(null, '', '/');
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  await i18n.changeLanguage('pt-BR');
});

afterEach(() => {
  cleanup();
});

// O jsdom não implementa `<dialog>` modal nem `matchMedia`. Os stubs abaixo cobrem
// o necessário para testes de componente; o comportamento real fica nos e2e.
Object.assign(HTMLDialogElement.prototype, {
  showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  },
  close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList,
});

// O jsdom não tem `IntersectionObserver` nem `scrollIntoView`.
window.IntersectionObserver = MockIntersectionObserver;
// jsdom não desenha em canvas: sem contexto 2D, a chuva de caracteres não anima.
HTMLCanvasElement.prototype.getContext = () => null;
Element.prototype.scrollIntoView = function scrollIntoView() {
  // no-op: o jsdom não faz layout.
};

afterEach(() => {
  MockIntersectionObserver.instances = [];
});
