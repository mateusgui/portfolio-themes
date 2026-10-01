import { describe, expect, it } from 'vitest';

import { MODULES, groupCoverage, type FileCoverage } from './modules.ts';

function file(covered: number, total: number): FileCoverage {
  const counter = { covered, total };
  return { lines: counter, statements: counter, functions: counter, branches: counter };
}

const [themes, , navigation] = MODULES;

describe('cobertura por módulo', () => {
  it('soma os arquivos do módulo, sem misturar outros', () => {
    const totals = groupCoverage(themes, [
      ['src/themes/registry.ts', file(9, 10)],
      ['src/themes/hacker/CharacterRain.tsx', file(7, 10)],
      ['src/i18n/index.ts', file(0, 10)],
    ]);

    expect(totals.lines).toBe(80);
    expect(totals.branches).toBe(80);
  });

  it('navegação junta hooks e layout', () => {
    const totals = groupCoverage(navigation, [
      ['src/hooks/scrollSpy.ts', file(10, 10)],
      ['src/layout/Sidebar.tsx', file(0, 10)],
    ]);

    expect(totals.functions).toBe(50);
  });

  it('módulo sem nada a cobrir conta como 100%', () => {
    expect(groupCoverage(themes, []).statements).toBe(100);
  });
});
