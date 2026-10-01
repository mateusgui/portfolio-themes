import { describe, expect, it } from 'vitest';

// Todos os testes do projeto: unitários, de componente e e2e.
const sources = import.meta.glob<string>(
  ['../**/*.test.{ts,tsx}', '../../e2e/*.spec.ts', '../../scripts/**/*.test.ts'],
  { query: '?raw', import: 'default', eager: true },
);

/** Critérios de aceite do MVP: cada um precisa de pelo menos um teste com o ID no nome. */
const CRITERIA = Array.from(
  { length: 12 },
  (_, index) => `CA-${String(index + 1).padStart(2, '0')}`,
);

/** Nomes de teste (`it`, `test`, `describe`) que citam o critério. */
function testNamesWith(id: string) {
  const name = new RegExp(String.raw`(?:it|test|describe)(?:\.\w+)*\(\s*[\`'"][^\`'"]*${id}`);
  return Object.entries(sources)
    .filter(([path, code]) => !path.endsWith('acceptance.test.ts') && name.test(code))
    .map(([path]) => path);
}

describe('critérios de aceite', () => {
  it.each(CRITERIA)('%s tem teste automatizado', (id) => {
    expect(testNamesWith(id)).not.toEqual([]);
  });
});
