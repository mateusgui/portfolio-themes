/**
 * Idiomas do site, cada um com o nome no próprio idioma (como aparece no seletor)
 * e o código curto usado no seletor em telas estreitas.
 */
export const LANGUAGES = [
  { code: 'pt-BR', name: 'Português', short: 'PT' },
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'es', name: 'Español', short: 'ES' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

export const FALLBACK_LANGUAGE: Language = 'en';

/**
 * Página pré-gerada de cada idioma (SEO e prévia de compartilhamento). Abrir uma
 * delas conta como escolha manual; o script inline do `index.html` repete estes
 * caminhos e precisa bater com eles.
 */
export const LANGUAGE_PATHS: Record<Language, `/${string}/`> = {
  'pt-BR': '/pt/',
  en: '/en/',
  es: '/es/',
};

/** Chave do `localStorage` com a escolha manual do usuário. */
export const LANGUAGE_STORAGE_KEY = 'portfolio:lang';

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some(({ code }) => code === value);
}

function baseOf(tag: string) {
  return tag.split('-')[0]?.toLowerCase() ?? '';
}

/**
 * Idioma inicial: a escolha salva vence; depois cada preferência do navegador,
 * em ordem, casando primeiro o código exato e depois o prefixo (`pt-PT` usa
 * `pt-BR`, `es-AR` usa `es`); sem nenhuma correspondência, `en`.
 */
export function detectLanguage(saved: string | null, preferred: readonly string[]): Language {
  if (isLanguage(saved)) return saved;

  for (const tag of preferred) {
    const exact = LANGUAGES.find(({ code }) => code.toLowerCase() === tag.toLowerCase());
    if (exact) return exact.code;

    const byPrefix = LANGUAGES.find(({ code }) => baseOf(code) === baseOf(tag));
    if (byPrefix) return byPrefix.code;
  }

  return FALLBACK_LANGUAGE;
}

/** Preferências do navegador; alguns só expõem `navigator.language`. */
export function browserLanguages(
  nav: Pick<Navigator, 'languages' | 'language'> = navigator,
): readonly string[] {
  return nav.languages.length > 0 ? nav.languages : [nav.language];
}

/** Lê a escolha salva; o `localStorage` pode estar bloqueado (modo privado, políticas). */
export function readSavedLanguage(): string | null {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveLanguage(language: Language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Sem armazenamento, a escolha vale só para esta visita.
  }
}
