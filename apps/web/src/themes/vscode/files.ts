import { useTranslation } from 'react-i18next';

import type { SectionId } from '../../sections/sections.ts';

/** Extensão fixa de cada seção; o nome do arquivo segue o idioma. */
export const EXTENSIONS: Record<SectionId, string> = {
  inicio: 'jsx',
  sobre: 'md',
  skills: 'json',
  projetos: 'ts',
  experiencia: 'php',
  formacao: 'py',
  contato: 'env',
};

/** Rótulo curto do ícone, no estilo dos ícones de arquivo da IDE. */
export const ICON_LABELS: Record<string, string> = {
  jsx: 'JS',
  md: 'M↓',
  json: '{}',
  ts: 'TS',
  php: 'php',
  py: 'py',
  env: '$',
};

/** Nome do arquivo da seção no idioma atual (`sobre.md`, `about.md`...). */
export function useFileName(id: SectionId): string {
  const { t } = useTranslation();
  return `${t(`vscode.files.${id}`)}.${EXTENSIONS[id]}`;
}
