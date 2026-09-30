import { useLanguage } from '../i18n/index.ts';
import type { Language } from '../i18n/languages.ts';
import { content as en } from './en/index.ts';
import { content as es } from './es/index.ts';
import { content as ptBR } from './pt-BR/index.ts';
import type { Content } from './types.ts';

export const CONTENT: Record<Language, Content> = {
  'pt-BR': ptBR,
  en,
  es,
};

export function getContent(language: Language): Content {
  return CONTENT[language];
}

/** Conteúdo das seções no idioma atual. */
export function useContent(): Content {
  return getContent(useLanguage());
}
