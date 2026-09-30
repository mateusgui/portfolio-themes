/** Faixa de leitura: a seção que cruza a faixa entre 30% e 40% da altura da tela é a atual. */
export const READING_BAND_MARGIN = '-30% 0px -60% 0px';

/** Tolerância, em px, para considerar a página no topo ou no fim (zoom gera frações). */
const EDGE_TOLERANCE = 1;

interface ResolveInput<Id extends string> {
  /** Seções em ordem de documento. */
  ids: readonly Id[];
  /** Seções que estão cruzando a faixa de leitura agora. */
  intersecting: ReadonlySet<Id>;
  scrollY: number;
  viewportHeight: number;
  scrollHeight: number;
  previous: Id;
}

/**
 * Decide a seção ativa. O topo ativa a primeira e o fim ativa a última, mesmo
 * curta demais para chegar à faixa. Fora disso vale a primeira seção na faixa;
 * num vão sem nenhuma, a anterior continua ativa.
 */
export function resolveActiveSection<Id extends string>({
  ids,
  intersecting,
  scrollY,
  viewportHeight,
  scrollHeight,
  previous,
}: ResolveInput<Id>): Id {
  const first = ids[0];
  const last = ids[ids.length - 1];
  if (first === undefined || last === undefined) return previous;

  if (scrollY <= EDGE_TOLERANCE) return first;
  if (scrollY + viewportHeight >= scrollHeight - EDGE_TOLERANCE) return last;

  return ids.find((id) => intersecting.has(id)) ?? previous;
}

/** Converte `#projetos` no id da seção, ou `null` se o hash não for de uma seção. */
export function sectionIdFromHash<Id extends string>(hash: string, ids: readonly Id[]): Id | null {
  const candidate = hash.replace(/^#/, '');
  return ids.find((id) => id === candidate) ?? null;
}

/** Rolagem suave, ou instantânea com `prefers-reduced-motion`. */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
}

interface Box {
  top: number;
  bottom: number;
}

/**
 * `scrollTop` que o contêiner precisa para mostrar o item inteiro, ou `null` se
 * ele já estiver visível. Usa as caixas na tela (`getBoundingClientRect`).
 */
export function scrollOffsetToReveal(
  container: Box & { scrollTop: number },
  item: Box,
): number | null {
  if (item.top < container.top) return container.scrollTop - (container.top - item.top);
  if (item.bottom > container.bottom) return container.scrollTop + (item.bottom - container.bottom);
  return null;
}
