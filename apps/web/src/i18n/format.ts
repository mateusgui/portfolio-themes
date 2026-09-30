import type { Language } from './languages.ts';

/** Mês e ano no formato `AAAA-MM`, como nos dados de experiência e formação. */
export type YearMonth = `${number}-${number}`;

function toDate(value: YearMonth) {
  const [year = 0, month = 1] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1));
}

/** "mar. de 2024", "Mar 2024", "mar 2024", conforme o idioma. */
export function formatYearMonth(value: YearMonth, language: Language) {
  return new Intl.DateTimeFormat(language, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(toDate(value));
}

/** Período de uma experiência; sem fim, usa o rótulo traduzido de "atual". */
export function formatPeriod(
  start: YearMonth,
  end: YearMonth | null,
  language: Language,
  presentLabel: string,
) {
  const from = formatYearMonth(start, language);
  const to = end ? formatYearMonth(end, language) : presentLabel;
  return `${from} – ${to}`;
}
