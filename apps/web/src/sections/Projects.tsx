import { ImageIcon, LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useContent } from '../content/index.ts';
import type { Project } from '../content/types.ts';
import { GitHubIcon } from '../layout/BrandIcons.tsx';
import { Chips } from './Chips.tsx';
import { Section } from './Section.tsx';

function ProjectCard({ project }: { project: Project }) {
  const { t } = useTranslation();
  const titleId = `projeto-${project.id}`;

  return (
    <article
      aria-labelledby={titleId}
      data-card="project"
      className="flex flex-col gap-4 rounded-theme border border-border bg-surface p-6 shadow-theme"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={titleId} className="font-heading text-xl font-semibold">
          {project.title}
        </h3>
        {project.visibility === 'private' && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
            <LockIcon aria-hidden="true" className="size-3" />
            {t('projects.private')}
          </span>
        )}
      </div>

      {project.images.length > 0 ? (
        <ul className="grid gap-2">
          {project.images.map((image) => (
            <li key={image.src}>
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className="h-auto w-full rounded-theme border border-border"
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-theme border border-dashed border-border bg-surface-alt text-sm text-muted">
          <ImageIcon aria-hidden="true" className="size-6" />
          {t('projects.screenshotsSoon')}
        </div>
      )}

      <p className="leading-relaxed">{project.description}</p>

      <Chips items={project.stack} label={t('projects.stack')} />

      {project.visibility === 'public' && project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t('projects.code')}: ${project.title} ${t('newTab')}`}
          className="inline-flex items-center gap-2 self-start font-semibold text-accent underline-offset-4 hover:underline"
        >
          <GitHubIcon className="size-4" />
          {t('projects.code')}
        </a>
      )}
    </article>
  );
}

export function Projects() {
  const { t } = useTranslation();
  const { projects } = useContent();

  return (
    <Section id="projetos" title={t('sections.projetos')}>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Section>
  );
}
