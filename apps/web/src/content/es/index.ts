import { profile } from '../profile.ts';
import type { Content } from '../types.ts';

export const content: Content = {
  hero: {
    headline: 'De la base de datos a la interfaz: sistemas que funcionan en producción.',
  },

  about: {
    paragraphs: [
      'Soy Desarrollador Full Stack, titulado en Tecnología de la Información por la UFMS, con experiencia en sistemas en producción, del back-end (Python, C#/.NET, PHP, Node.js) al front-end (React, Vue.js, Next.js, TypeScript).',
      'En Exbe Finance & Tech fui responsable técnico y coordinador de un equipo de 18 personas, dueño técnico de dos sistemas en producción y el punto de contacto directo con el cliente, desde el levantamiento de requisitos hasta la entrega.',
      'Uso Claude Code a diario para programar, revisar y depurar, y así acelerar las entregas sin renunciar a la calidad.',
    ],
  },

  skills: [
    {
      id: 'frontend',
      title: 'Front-end',
      items: [
        'TypeScript',
        'JavaScript (ES6+)',
        'React',
        'Next.js',
        'Vue.js',
        'HTML5',
        'CSS3',
        'Tailwind CSS',
      ],
    },
    {
      id: 'backend',
      title: 'Back-end',
      items: ['Python (FastAPI)', 'C# / .NET', 'PHP', 'Node.js', 'APIs REST'],
    },
    {
      id: 'databases',
      title: 'Bases de datos',
      items: ['PostgreSQL', 'SQL Server', 'MySQL', 'SQLite'],
    },
    {
      id: 'devops',
      title: 'DevOps y prácticas',
      items: ['Docker', 'Git', 'GitHub', 'Scrum', 'Kanban'],
    },
    {
      id: 'ai',
      title: 'IA y productividad',
      items: [
        'Claude Code (uso diario)',
        'Ingeniería de prompts',
        'SDD',
        'Revisión de código y depuración asistidas por IA',
      ],
    },
  ],

  projects: [
    {
      id: 'index',
      title: 'Proyecto INDEX',
      description:
        'Lectura e indexación automatizada de historias clínicas mediante OCR, con extracción por REGEX para clasificar y nombrar archivos PDF.',
      stack: ['Python', 'FastAPI', 'Uvicorn', 'Pydantic v2', 'JWT', 'bcrypt', 'PostgreSQL 16'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'protocol-tracker',
      title: 'Protocol Tracker',
      description:
        'Control de productividad y métricas de la operación de digitalización, en producción.',
      stack: ['PHP'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'crm',
      title: 'CRM para Gestión de Lavandería',
      description: 'Sistema full stack con órdenes de servicio, agenda y finanzas.',
      stack: ['TypeScript', 'Next.js', 'React', 'Prisma', 'PostgreSQL', 'Docker'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'portfolio',
      title: 'Este portafolio',
      description:
        'Portafolio con temas dinámicos, cambio de idioma y navegación por secciones sincronizada con el desplazamiento.',
      stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'i18next'],
      visibility: 'public',
      repoUrl: profile.repoUrl,
      images: [],
    },
  ],

  experience: [
    {
      id: 'exbe',
      role: 'Desarrollador Júnior II',
      company: 'Exbe Finance & Tech',
      location: 'Campo Grande, MS',
      start: '2024-11',
      end: '2026-09',
      highlights: [
        'Fui responsable técnico y coordinador de un equipo de digitalización de 18 personas, en una operación con más de 10 millones de páginas digitalizadas.',
        'Fui el responsable técnico de dos sistemas propios en producción: Protocol Tracker y el Proyecto INDEX.',
        'Levanté requisitos con el cliente e impulsé mejoras continuas de productividad.',
        'Realicé mantenimiento correctivo y evolutivo, con consultas y modelado en bases de datos relacionales.',
        'Usé Claude Code a diario en el flujo de desarrollo.',
      ],
    },
    {
      id: 'nota-control',
      role: 'Analista de Soporte de Sistemas',
      company: 'Nota Control',
      location: 'Campo Grande, MS',
      start: '2023-02',
      end: '2024-07',
      highlights: [
        'Brindé soporte técnico a municipios en los sistemas de emisión de NFS-e (factura electrónica de servicios) y en el sistema tributario, con análisis y documentación de errores.',
        'Analicé archivos XML para la integración entre sistemas y usé SQL Server para informes y corrección de inconsistencias.',
      ],
    },
  ],

  education: [
    {
      id: 'ufms',
      course: 'Tecnología de la Información',
      degree: 'Título de Tecnólogo (CST)',
      institution: 'UFMS',
      start: '2022-08',
      end: '2025-07',
    },
    {
      id: 'dev-club',
      course: 'Programación de Computadoras (General)',
      institution: 'Dev Club',
      start: '2025-01',
      end: '2026-01',
    },
  ],

  contact: {
    intro:
      '¿Quieres hablar sobre una vacante, un proyecto o una idea? La forma más rápida es por correo.',
  },
};
