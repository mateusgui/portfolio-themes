import {
  BriefcaseIcon,
  CodeXmlIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  HouseIcon,
  MailIcon,
  UserRoundIcon,
  type LucideIcon,
} from 'lucide-react';

interface SectionDefinition {
  /** Âncora estável da URL (`#projetos`); não muda com o idioma. */
  id: string;
  icon: LucideIcon;
}

export const SECTIONS = [
  { id: 'inicio', icon: HouseIcon },
  { id: 'sobre', icon: UserRoundIcon },
  { id: 'skills', icon: CodeXmlIcon },
  { id: 'projetos', icon: FolderOpenIcon },
  { id: 'experiencia', icon: BriefcaseIcon },
  { id: 'formacao', icon: GraduationCapIcon },
  { id: 'contato', icon: MailIcon },
] as const satisfies readonly SectionDefinition[];

export type SectionId = (typeof SECTIONS)[number]['id'];
