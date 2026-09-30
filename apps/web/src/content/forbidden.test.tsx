import { describe, expect, it } from 'vitest';

import { AppShell } from '../app/AppShell.tsx';
import i18n, { resources } from '../i18n/index.ts';
import { LANGUAGES } from '../i18n/languages.ts';
import { renderWithProviders } from '../tests/render.tsx';
import indexHtml from '../../index.html?raw';
import { findForbidden } from './forbidden.ts';
import { getContent } from './index.ts';
import { availability, profile } from './profile.ts';

const violations = findForbidden;

describe('conteúdo excluído nunca aparece', () => {
  it.each(LANGUAGES.map(({ code }) => code))('página renderizada em %s', async (language) => {
    await i18n.changeLanguage(language);
    const { container } = renderWithProviders(<AppShell />);

    const attributes = [...container.querySelectorAll('*')].flatMap((element) =>
      [...element.attributes].map((attribute) => attribute.value),
    );
    expect(violations(container.textContent)).toEqual([]);
    expect(violations(attributes.join('\n'))).toEqual([]);
  });

  it.each(LANGUAGES.map(({ code }) => code))('dados de conteúdo em %s', (language) => {
    expect(violations(JSON.stringify(getContent(language)))).toEqual([]);
    expect(violations(JSON.stringify(resources[language]))).toEqual([]);
  });

  it('perfil e index.html', () => {
    expect(violations(JSON.stringify({ profile, availability }))).toEqual([]);
    expect(violations(indexHtml)).toEqual([]);
  });

  it('o detector pega os padrões proibidos', () => {
    expect(violations('Arte Finalista na Só Cópias')).not.toEqual([]);
    expect(violations('Projeto Hora do Lixo')).not.toEqual([]);
    expect(violations('(67) 99123-4567')).not.toEqual([]);
    expect(violations('67991234567')).not.toEqual([]);
    expect(violations('href="tel:+5567"')).not.toEqual([]);
    expect(violations('nov. de 2024 – set. de 2026, 10 milhões de páginas')).toEqual([]);
  });
});
