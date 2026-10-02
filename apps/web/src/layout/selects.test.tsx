import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import i18n from '../i18n/index.ts';
import { LANGUAGE_STORAGE_KEY } from '../i18n/languages.ts';
import { renderWithProviders } from '../tests/render.tsx';
import { LanguageSelect } from './LanguageSelect.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

/** Simula um `change` com valor fora das opções (extensão, DevTools, script de terceiros). */
function changeToUnknown(select: HTMLSelectElement) {
  const option = document.createElement('option');
  option.value = 'desconhecido';
  select.append(option);
  fireEvent.change(select, { target: { value: 'desconhecido' } });
}

describe('seletores ignoram valores desconhecidos', () => {
  it('tema', () => {
    document.documentElement.dataset.theme = 'paper';
    renderWithProviders(<ThemeSwitcher />);

    changeToUnknown(screen.getByRole('combobox', { name: 'Temas' }));

    expect(document.documentElement.dataset.theme).toBe('paper');
  });

  it('idioma', () => {
    renderWithProviders(<LanguageSelect />);

    changeToUnknown(screen.getByRole('combobox', { name: 'Idioma' }));

    expect(i18n.language).toBe('pt-BR');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });
});
