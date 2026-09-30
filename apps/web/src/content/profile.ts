import type { Language } from '../i18n/languages.ts';

/** Dados do perfil que não mudam com o idioma. Telefone não é exibido em lugar nenhum. */
export const profile = {
  name: 'Mateus Guimarães Moraes Vilela',
  initials: 'MG',
  location: 'Campo Grande, MS',
  email: 'mateusguimaraesmoraes14@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/mateusguimaraesmoraes',
    github: 'https://github.com/mateusgui',
  },
  /** Repositório público deste portfólio. */
  repoUrl: 'https://github.com/mateusgui/portfolio-themes',
} as const;

/** Selo "Disponível para novas oportunidades" no Hero; `false` esconde o selo. */
export const availability = {
  open: true,
};

/** Arquivo do currículo de cada idioma em `public/resume/` (gerados por `npm run resume`). */
export const RESUME_FILES: Record<Language, string> = {
  'pt-BR': 'curriculo-pt-BR.pdf',
  en: 'resume-en.pdf',
  es: 'curriculo-es.pdf',
};

export function resumeHref(language: Language) {
  return `/resume/${RESUME_FILES[language]}`;
}
