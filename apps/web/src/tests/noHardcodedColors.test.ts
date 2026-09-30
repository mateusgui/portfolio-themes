import { describe, expect, it } from 'vitest';

// Código dos componentes (sem os testes): cores só podem vir dos tokens do tema.
const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

const HARDCODED_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(|-\[(?:#|color:)/i;

describe('sem cores fixas nos componentes', () => {
  it('encontra os arquivos de código', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10);
  });

  it.each(Object.entries(sources))('%s usa só classes semânticas', (_path, code) => {
    const offending = code.split('\n').filter((line) => HARDCODED_COLOR.test(line));
    expect(offending).toEqual([]);
  });
});
