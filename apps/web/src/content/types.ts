import type { YearMonth } from '../i18n/format.ts';

interface SkillGroup {
  id: 'frontend' | 'backend' | 'databases' | 'devops' | 'ai';
  title: string;
  items: readonly string[];
}

interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  start: YearMonth;
  /** `null` enquanto o vínculo estiver ativo. */
  end: YearMonth | null;
  highlights: readonly string[];
}

/** Print de projeto: WebP ou AVIF em `public/`, com o tamanho real (evita layout shift). */
interface ProjectImage {
  src: `/${string}.${'webp' | 'avif'}`;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  id: 'index' | 'protocol-tracker' | 'crm' | 'portfolio';
  title: string;
  description: string;
  stack: readonly string[];
  /** Privado: sem link de código nem de live, com selo "Privado". */
  visibility: 'private' | 'public';
  /** Só em projetos públicos. */
  repoUrl?: string;
  images: readonly ProjectImage[];
}

interface EducationEntry {
  id: string;
  course: string;
  degree?: string;
  institution: string;
  start: YearMonth;
  end: YearMonth | null;
}

/** Conteúdo das seções num idioma. Textos de interface ficam no i18n. */
export interface Content {
  hero: {
    headline: string;
  };
  about: {
    paragraphs: readonly string[];
  };
  skills: readonly SkillGroup[];
  projects: readonly Project[];
  experience: readonly ExperienceEntry[];
  education: readonly EducationEntry[];
  contact: {
    intro: string;
  };
}
