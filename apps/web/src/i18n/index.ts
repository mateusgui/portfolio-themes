import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next, useTranslation } from 'react-i18next';

import en from './locales/en/common.json';
import es from './locales/es/common.json';
import ptBR from './locales/pt-BR/common.json';
import {
  FALLBACK_LANGUAGE,
  LANGUAGES,
  detectLanguage,
  isLanguage,
  readSavedLanguage,
  saveLanguage,
  type Language,
} from './languages.ts';

export const resources = {
  'pt-BR': { common: ptBR },
  en: { common: en },
  es: { common: es },
} as const satisfies Record<Language, { common: typeof ptBR }>;

/** `<html lang>`, `<title>` e meta description acompanham o idioma. */
function syncDocument(language: string) {
  document.documentElement.lang = language;
  document.title = i18n.t('meta.title');
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', i18n.t('meta.description'));
}

// A regra de detecção é a nossa (`detectLanguage`); o detector só a encaixa no
// i18next. Sem cache: só a escolha manual é salva, pelo `changeLanguage` abaixo.
const detector = new LanguageDetector();
detector.addDetector({
  name: 'portfolio',
  lookup: () =>
    detectLanguage(
      readSavedLanguage(),
      navigator.languages.length > 0 ? navigator.languages : [navigator.language],
    ),
});

i18n.on('languageChanged', syncDocument);

void i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    ns: ['common'],
    supportedLngs: LANGUAGES.map(({ code }) => code),
    fallbackLng: FALLBACK_LANGUAGE,
    load: 'currentOnly',
    detection: { order: ['portfolio'], caches: [] },
    // Recursos já vêm no bundle: inicializa de forma síncrona, antes do primeiro render.
    initAsync: false,
    interpolation: { escapeValue: false },
  });

/** Troca de idioma pela escolha do usuário: persiste e vence a detecção nas próximas visitas. */
export function changeLanguage(language: Language) {
  saveLanguage(language);
  return i18n.changeLanguage(language);
}

/** Idioma atual, já validado. */
export function useLanguage(): Language {
  const { i18n: instance } = useTranslation();
  const current = instance.resolvedLanguage;
  return isLanguage(current) ? current : FALLBACK_LANGUAGE;
}

export default i18n;
