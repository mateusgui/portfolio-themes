/**
 * Resumo da cobertura (RNF-06) em markdown, por módulo: tema, i18n e navegação.
 * Lê `coverage/coverage-summary.json` (gerado por `npm run test:coverage`). No CI,
 * a saída vai para o resumo do job:
 *
 *   npm run coverage:summary -w web --silent >> "$GITHUB_STEP_SUMMARY"
 */
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MODULES,
  METRICS,
  THRESHOLD,
  groupCoverage,
  type FileCoverage,
} from './coverage/modules.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const summary = JSON.parse(
  readFileSync(join(root, 'coverage/coverage-summary.json'), 'utf-8'),
) as Record<string, FileCoverage>;

const files = Object.entries(summary)
  .filter(([path]) => path !== 'total')
  .map(([path, coverage]) => [relative(root, path).replaceAll('\\', '/'), coverage] as const);

const rows = MODULES.map((module) => {
  const totals = groupCoverage(module, files);
  const cells = METRICS.map((metric) => {
    const pct = totals[metric];
    return `${pct >= THRESHOLD ? '✅' : '❌'} ${pct.toFixed(1)}%`;
  });
  return `| ${module.label} | ${cells.join(' | ')} |`;
});

console.log(`## Cobertura (meta: ${String(THRESHOLD)}%)

| Módulo | Linhas | Statements | Funções | Ramos |
|---|---|---|---|---|
${rows.join('\n')}
`);
