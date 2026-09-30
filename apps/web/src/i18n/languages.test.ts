import { describe, expect, it } from 'vitest';

import { detectLanguage } from './languages.ts';

describe('detectLanguage', () => {
  it.each([
    [['pt-BR'], 'pt-BR'],
    [['pt'], 'pt-BR'],
    [['pt-PT'], 'pt-BR'],
    [['en-US'], 'en'],
    [['en-GB'], 'en'],
    [['es'], 'es'],
    [['es-AR'], 'es'],
    [['es-419'], 'es'],
    [['fr-FR'], 'en'],
    [[], 'en'],
  ])('navegador em %j abre em %s', (preferred, expected) => {
    expect(detectLanguage(null, preferred)).toBe(expected);
  });

  it('segue a ordem de prioridade do navegador', () => {
    expect(detectLanguage(null, ['fr-FR', 'es-MX', 'en-US'])).toBe('es');
    expect(detectLanguage(null, ['de', 'pt-PT', 'en'])).toBe('pt-BR');
  });

  it('ignora maiúsculas e minúsculas', () => {
    expect(detectLanguage(null, ['PT-br'])).toBe('pt-BR');
  });

  it('a escolha salva vence o navegador', () => {
    expect(detectLanguage('en', ['pt-BR'])).toBe('en');
    expect(detectLanguage('es', ['fr'])).toBe('es');
  });

  it('ignora escolha salva inválida', () => {
    expect(detectLanguage('fr', ['pt-BR'])).toBe('pt-BR');
    expect(detectLanguage('', ['es'])).toBe('es');
  });
});
