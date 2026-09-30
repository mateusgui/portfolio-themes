import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { MockIntersectionObserver } from './intersectionObserver.ts';

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
Element.prototype.scrollIntoView = function scrollIntoView() {
  // no-op: o jsdom não faz layout.
};

afterEach(() => {
  MockIntersectionObserver.instances = [];
});
