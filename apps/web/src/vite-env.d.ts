/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL pública do site. Variáveis VITE_* são públicas: nunca use para segredos. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
