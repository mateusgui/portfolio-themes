import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import en from './locales/en/common.json';
import es from './locales/es/common.json';
import ptBR from './locales/pt-BR/common.json';
import {
  FALLBACK_LANGUAGE,
  browserLanguages,
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

i18n.on('languageChanged', syncDocument);

void i18n.use(initReactI18next).init({
  // Idioma inicial pela nossa regra (escolha salva > navegador > `en`). Nada é
  // salvo aqui: só a escolha manual, pelo `changeLanguage` abaixo.
  lng: detectLanguage(readSavedLanguage(), browserLanguages()),
  resources,
  defaultNS: 'common',
  ns: ['common'],
  supportedLngs: LANGUAGES.map(({ code }) => code),
  fallbackLng: FALLBACK_LANGUAGE,
  load: 'currentOnly',
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
