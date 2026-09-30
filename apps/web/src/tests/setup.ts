import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import i18n from '../i18n/index.ts';

import { MockIntersectionObserver } from './intersectionObserver.ts';

// Os testes de componente usam os textos em pt-BR; cada teste começa sem escolha salva.
beforeEach(async () => {
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
