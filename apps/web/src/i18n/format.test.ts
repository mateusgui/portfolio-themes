import { describe, expect, it } from 'vitest';

import { formatPeriod, formatYearMonth } from './format.ts';

describe('formatYearMonth', () => {
  it.each([
    ['pt-BR', 'mar. de 2024'],
    ['en', 'Mar 2024'],
    ['es', 'mar 2024'],
  ] as const)('formata mês e ano em %s', (language, expected) => {
    expect(formatYearMonth('2024-03', language)).toBe(expected);
  });

  it('não muda de mês por causa do fuso horário', () => {
    expect(formatYearMonth('2024-01', 'en')).toBe('Jan 2024');
  });
});

describe('formatPeriod', () => {
  it('formata início e fim', () => {
    expect(formatPeriod('2023-02', '2026-09', 'en', 'present')).toBe('Feb 2023 – Sep 2026');
  });

  it('sem fim, usa o rótulo de "atual"', () => {
    expect(formatPeriod('2025-01', null, 'pt-BR', 'o momento')).toBe('jan. de 2025 – o momento');
  });
});
