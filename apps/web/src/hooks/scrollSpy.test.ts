import { describe, expect, it } from 'vitest';

import { resolveActiveSection, scrollOffsetToReveal, sectionIdFromHash } from './scrollSpy.ts';

const IDS = ['inicio', 'sobre', 'skills', 'contato'] as const;
type Id = (typeof IDS)[number];

function resolve(overrides: Partial<Parameters<typeof resolveActiveSection<Id>>[0]>) {
  return resolveActiveSection<Id>({
    ids: IDS,
    intersecting: new Set(),
    scrollY: 500,
    viewportHeight: 800,
    scrollHeight: 4000,
    previous: 'sobre',
    ...overrides,
  });
}

describe('resolveActiveSection', () => {
  it('no topo ativa a primeira seção, mesmo com outra na faixa', () => {
    expect(resolve({ scrollY: 0, intersecting: new Set(['sobre']) })).toBe('inicio');
  });

  it('no fim ativa a última seção, mesmo curta demais para chegar à faixa', () => {
    expect(resolve({ scrollY: 3200, intersecting: new Set(['skills']) })).toBe('contato');
  });

  it('tolera frações de pixel no fim da página (zoom)', () => {
    expect(resolve({ scrollY: 3199.4 })).toBe('contato');
  });

  it('no meio ativa a seção na faixa de leitura', () => {
    expect(resolve({ intersecting: new Set(['skills']) })).toBe('skills');
  });

  it('com duas seções na faixa, vale a primeira na ordem do documento', () => {
    expect(resolve({ intersecting: new Set(['skills', 'sobre']) })).toBe('sobre');
  });

  it('num vão sem seção na faixa, mantém a anterior', () => {
    expect(resolve({ previous: 'skills' })).toBe('skills');
  });
});

describe('sectionIdFromHash', () => {
  it('reconhece o hash de uma seção', () => {
    expect(sectionIdFromHash('#skills', IDS)).toBe('skills');
  });

  it.each(['', '#', '#conteudo', '#SKILLS', '#skills-titulo'])('ignora %j', (hash) => {
    expect(sectionIdFromHash(hash, IDS)).toBeNull();
  });
});

describe('scrollOffsetToReveal', () => {
  const container = { top: 100, bottom: 500, scrollTop: 200 };

  it('não rola se o item já está visível', () => {
    expect(scrollOffsetToReveal(container, { top: 120, bottom: 160 })).toBeNull();
  });

  it('rola para baixo até o item aparecer inteiro', () => {
    expect(scrollOffsetToReveal(container, { top: 480, bottom: 520 })).toBe(220);
  });

  it('rola para cima até o item aparecer inteiro', () => {
    expect(scrollOffsetToReveal(container, { top: 60, bottom: 100 })).toBe(160);
  });
});
