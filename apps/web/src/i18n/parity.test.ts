import { describe, expect, it } from 'vitest';

import { resources } from './index.ts';

/** Caminhos de todas as folhas: `navbar.openMenu`, `sections.inicio`... */
function leafKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafValues(value: unknown): unknown[] {
  if (typeof value !== 'object' || value === null) return [value];
  return Object.values(value).flatMap(leafValues);
}

describe('paridade das traduções', () => {
  const reference = leafKeys(resources['pt-BR'].common).sort();

  it.each(['en', 'es'] as const)('%s tem exatamente as mesmas chaves que pt-BR', (language) => {
    expect(leafKeys(resources[language].common).sort()).toEqual(reference);
  });

  it.each(['pt-BR', 'en', 'es'] as const)('%s não tem textos vazios', (language) => {
    for (const text of leafValues(resources[language].common)) {
      expect(typeof text === 'string' && text.trim().length > 0).toBe(true);
    }
  });
});
