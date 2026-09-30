import 'i18next';

import type common from './locales/pt-BR/common.json';

// Chaves tipadas: `t('sections.projetos')` é checado pelo TypeScript.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: { common: typeof common };
  }
}
