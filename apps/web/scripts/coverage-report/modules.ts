/** Módulos com meta de cobertura (RNF-06). Os mesmos globs ficam no `vite.config.ts`. */
export const THRESHOLD = 80;

export const MODULES = [
  { label: 'Tema', prefixes: ['src/themes/'] },
  { label: 'i18n', prefixes: ['src/i18n/'] },
  { label: 'Navegação', prefixes: ['src/hooks/', 'src/layout/'] },
] as const;

export const METRICS = ['lines', 'statements', 'functions', 'branches'] as const;

type Metric = (typeof METRICS)[number];

interface Counter {
  total: number;
  covered: number;
}

/** Entrada do `coverage-summary.json` do istanbul/v8. */
export type FileCoverage = Record<Metric, Counter>;

/** Percentual de cada métrica somando os arquivos do módulo (100% se não houver nada a cobrir). */
export function groupCoverage(
  module: (typeof MODULES)[number],
  files: readonly (readonly [path: string, coverage: FileCoverage])[],
): Record<Metric, number> {
  const inModule = files.filter(([path]) =>
    module.prefixes.some((prefix) => path.startsWith(prefix)),
  );
  const result = {} as Record<Metric, number>;
  for (const metric of METRICS) {
    const total = inModule.reduce((sum, [, coverage]) => sum + coverage[metric].total, 0);
    const covered = inModule.reduce((sum, [, coverage]) => sum + coverage[metric].covered, 0);
    result[metric] = total === 0 ? 100 : (covered / total) * 100;
  }
  return result;
}
