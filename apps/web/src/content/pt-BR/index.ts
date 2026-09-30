import { profile } from '../profile.ts';
import type { Content } from '../types.ts';

export const content: Content = {
  hero: {
    headline: 'Do banco de dados à interface: sistemas que funcionam em produção.',
  },

  about: {
    paragraphs: [
      'Sou Desenvolvedor Full Stack formado em Tecnologia da Informação pela UFMS, com experiência em sistemas em produção, do back-end (Python, C#/.NET, PHP, Node.js) ao front-end (React, Vue.js, Next.js, TypeScript).',
      'Na Exbe Finance & Tech, fui responsável técnico e coordenador de uma equipe de 18 pessoas, dono técnico de dois sistemas em produção e ponto de contato direto com o cliente, do levantamento de requisitos à entrega.',
      'Uso o Claude Code no dia a dia, em código, revisão e debugging, para acelerar entregas sem abrir mão de qualidade.',
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
      title: 'Bancos de dados',
      items: ['PostgreSQL', 'SQL Server', 'MySQL', 'SQLite'],
    },
    {
      id: 'devops',
      title: 'DevOps e práticas',
      items: ['Docker', 'Git', 'GitHub', 'Scrum', 'Kanban'],
    },
    {
      id: 'ai',
      title: 'IA e produtividade',
      items: [
        'Claude Code (uso diário)',
        'Engenharia de prompt',
        'SDD',
        'Code review e debugging assistidos por IA',
      ],
    },
  ],

  projects: [
    {
      id: 'index',
      title: 'Projeto INDEX',
      description:
        'Leitura e indexação automatizada de prontuários médicos via OCR, com extração por REGEX para classificar e nomear PDFs.',
      stack: ['Python', 'FastAPI', 'Uvicorn', 'Pydantic v2', 'JWT', 'bcrypt', 'PostgreSQL 16'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'protocol-tracker',
      title: 'Protocol Tracker',
      description:
        'Controle de produtividade e métricas da operação de digitalização, em produção.',
      stack: ['PHP'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'crm',
      title: 'CRM para Gestão de Lavanderia',
      description: 'Sistema full stack com ordens de serviço, agenda e financeiro.',
      stack: ['TypeScript', 'Next.js', 'React', 'Prisma', 'PostgreSQL', 'Docker'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'portfolio',
      title: 'Este portfólio',
      description:
        'Portfólio com temas dinâmicos, troca de idioma e navegação por seções sincronizada com a rolagem.',
      stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'i18next'],
      visibility: 'public',
      repoUrl: profile.repoUrl,
      images: [],
    },
  ],

  experience: [
    {
      id: 'exbe',
      role: 'Desenvolvedor Júnior II',
      company: 'Exbe Finance & Tech',
      location: 'Campo Grande, MS',
      start: '2024-11',
      end: '2026-09',
      highlights: [
        'Fui responsável técnico e coordenador de uma equipe de digitalização de 18 pessoas, numa operação com mais de 10 milhões de páginas digitalizadas.',
        'Fui o proprietário técnico de dois sistemas próprios em produção: o Protocol Tracker e o Projeto INDEX.',
        'Levantei requisitos com o cliente e conduzi melhorias contínuas de produtividade.',
        'Fiz manutenção corretiva e evolutiva, com consultas e modelagem em banco relacional.',
        'Usei o Claude Code diariamente no fluxo de desenvolvimento.',
      ],
    },
    {
      id: 'nota-control',
      role: 'Analista de Suporte de Sistemas',
      company: 'Nota Control',
      location: 'Campo Grande, MS',
      start: '2023-02',
      end: '2024-07',
      highlights: [
        'Dei suporte técnico a municípios nos sistemas de emissão de NFS-e e no sistema tributário, com análise e documentação de erros.',
        'Analisei arquivos XML para integração entre sistemas e usei SQL Server para relatórios e correção de inconsistências.',
      ],
    },
  ],

  education: [
    {
      id: 'ufms',
      course: 'Tecnologia da Informação',
      degree: 'Curso Superior de Tecnologia (CST)',
      institution: 'UFMS',
      start: '2022-08',
      end: '2025-07',
    },
    {
      id: 'dev-club',
      course: 'Programação de Computadores (Geral)',
      institution: 'Dev Club',
      start: '2025-01',
      end: '2026-01',
    },
  ],

  contact: {
    intro:
      'Quer conversar sobre uma vaga, um projeto ou uma ideia? O jeito mais rápido é por e-mail.',
  },
};
