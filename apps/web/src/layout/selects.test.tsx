import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n from '../i18n/index.ts';
import { LANGUAGE_STORAGE_KEY } from '../i18n/languages.ts';
import { renderWithProviders } from '../tests/render.tsx';
import { LanguageSelect } from './LanguageSelect.tsx';

/** Simula um `change` com valor fora das opções (extensão, DevTools, script de terceiros). */
function changeToUnknown(select: HTMLSelectElement) {
  const option = document.createElement('option');
  option.value = 'desconhecido';
  select.append(option);
  fireEvent.change(select, { target: { value: 'desconhecido' } });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('seletor de idioma', () => {
  it('ignora valores desconhecidos', () => {
    renderWithProviders(<LanguageSelect />);

    changeToUnknown(screen.getByRole('combobox', { name: 'Idioma' }));

    expect(i18n.language).toBe('pt-BR');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });

  it('em telas estreitas mostra só o código, com o nome do idioma em aria-label', () => {
    const removeEventListener = vi.fn();
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({
          matches: query.includes('max-width'),
          media: query,
          addEventListener: () => undefined,
          removeEventListener,
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderWithProviders(<LanguageSelect />);
    const options = within(screen.getByRole('combobox', { name: 'Idioma' })).getAllByRole('option');

    expect(
      options.map((option) => [
        option.textContent,
        option.getAttribute('aria-label'),
        option.getAttribute('lang'),
      ]),
    ).toEqual([
      ['PT', 'Português', 'pt-BR'],
      ['EN', 'English', 'en'],
      ['ES', 'Español', 'es'],
    ]);

    unmount();
    expect(removeEventListener).toHaveBeenCalled();
  });
});
