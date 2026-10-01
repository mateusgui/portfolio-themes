import { afterEach, describe, expect, it, vi } from 'vitest';

import { browserLanguages, detectLanguage, readSavedLanguage, saveLanguage } from './languages.ts';

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

describe('preferências do navegador', () => {
  it('usa a lista de idiomas quando existe', () => {
    expect(browserLanguages({ languages: ['es-AR', 'en'], language: 'es-AR' })).toEqual([
      'es-AR',
      'en',
    ]);
  });

  it('cai no idioma único quando a lista vem vazia', () => {
    expect(browserLanguages({ languages: [], language: 'fr-FR' })).toEqual(['fr-FR']);
  });
});

describe('escolha salva com localStorage bloqueado (modo privado, políticas)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ler devolve null em vez de quebrar', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });

    expect(readSavedLanguage()).toBeNull();
  });

  it('salvar não quebra (a escolha vale só para a visita)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('cheio', 'QuotaExceededError');
    });

    expect(() => {
      saveLanguage('es');
    }).not.toThrow();
  });
});
