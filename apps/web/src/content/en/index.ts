import { profile } from '../profile.ts';
import type { Content } from '../types.ts';

export const content: Content = {
  hero: {
    headline: 'From database to interface: systems that run in production.',
  },

  about: {
    paragraphs: [
      "I'm a Full Stack Developer with a degree in Information Technology from UFMS and hands-on experience with production systems, from the back end (Python, C#/.NET, PHP, Node.js) to the front end (React, Vue.js, Next.js, TypeScript).",
      "At Exbe Finance & Tech, I was the technical lead and coordinator of an 18-person team, the technical owner of two production systems and the client's direct point of contact, from requirements gathering to delivery.",
      'I use Claude Code every day for coding, review and debugging, to ship faster without compromising on quality.',
    ],
  },

  skills: [
    {
      id: 'frontend',
      title: 'Front end',
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
      title: 'Back end',
      items: ['Python (FastAPI)', 'C# / .NET', 'PHP', 'Node.js', 'REST APIs'],
    },
    {
      id: 'databases',
      title: 'Databases',
      items: ['PostgreSQL', 'SQL Server', 'MySQL', 'SQLite'],
    },
    {
      id: 'devops',
      title: 'DevOps & practices',
      items: ['Docker', 'Git', 'GitHub', 'Scrum', 'Kanban'],
    },
    {
      id: 'ai',
      title: 'AI & productivity',
      items: [
        'Claude Code (daily use)',
        'Prompt engineering',
        'SDD',
        'AI-assisted code review and debugging',
      ],
    },
  ],

  projects: [
    {
      id: 'index',
      title: 'INDEX Project',
      description:
        'Automated reading and indexing of medical records via OCR, using REGEX extraction to classify and name PDFs.',
      stack: ['Python', 'FastAPI', 'Uvicorn', 'Pydantic v2', 'JWT', 'bcrypt', 'PostgreSQL 16'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'protocol-tracker',
      title: 'Protocol Tracker',
      description:
        'Productivity and metrics tracking for a document digitization operation, running in production.',
      stack: ['PHP'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'crm',
      title: 'Laundry Management CRM',
      description: 'Full stack system with work orders, scheduling and finances.',
      stack: ['TypeScript', 'Next.js', 'React', 'Prisma', 'PostgreSQL', 'Docker'],
      visibility: 'private',
      images: [],
    },
    {
      id: 'portfolio',
      title: 'This portfolio',
      description:
        'Portfolio with dynamic themes, language switching and section navigation synced with scrolling.',
      stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'i18next'],
      visibility: 'public',
      repoUrl: profile.repoUrl,
      images: [],
    },
  ],

  experience: [
    {
      id: 'exbe',
      role: 'Junior Developer II',
      company: 'Exbe Finance & Tech',
      location: 'Campo Grande, MS',
      start: '2024-11',
      end: '2026-09',
      highlights: [
        'Served as technical lead and coordinator of an 18-person digitization team, in an operation with more than 10 million pages digitized.',
        'Was the technical owner of two in-house systems in production: Protocol Tracker and the INDEX Project.',
        'Gathered requirements with the client and drove continuous productivity improvements.',
        'Handled corrective and evolutionary maintenance, including relational database queries and modeling.',
        'Used Claude Code daily as part of the development workflow.',
      ],
    },
    {
      id: 'nota-control',
      role: 'Systems Support Analyst',
      company: 'Nota Control',
      location: 'Campo Grande, MS',
      start: '2023-02',
      end: '2024-07',
      highlights: [
        'Provided technical support to municipalities for NFS-e (electronic service invoice) issuance and tax systems, analyzing and documenting errors.',
        'Analyzed XML files for system integrations and used SQL Server for reports and fixing data inconsistencies.',
      ],
    },
  ],

  education: [
    {
      id: 'ufms',
      course: 'Information Technology',
      degree: 'Technology Degree (CST, Brazilian undergraduate program)',
      institution: 'UFMS',
      start: '2022-08',
      end: '2025-07',
    },
    {
      id: 'dev-club',
      course: 'Computer Programming (General)',
      institution: 'Dev Club',
      start: '2025-01',
      end: '2026-01',
    },
  ],

  contact: {
    intro: 'Want to talk about a role, a project or an idea? Email is the fastest way to reach me.',
  },
};
