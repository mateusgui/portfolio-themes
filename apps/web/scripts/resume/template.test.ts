import { describe, expect, it } from 'vitest';

import { CONTENT } from '../../src/content/index.ts';
import { findForbidden } from '../../src/content/forbidden.ts';
import { RESUME_FILES, profile } from '../../src/content/profile.ts';
import { resources } from '../../src/i18n/index.ts';
import { LANGUAGES } from '../../src/i18n/languages.ts';
import { buildResumeHtml, resumeLabels } from './template.ts';

function resume(language: (typeof LANGUAGES)[number]['code']) {
  const html = buildResumeHtml({
    language,
    content: CONTENT[language],
    labels: resumeLabels(resources[language].common),
  });
  return new DOMParser().parseFromString(html, 'text/html');
}

describe.each(LANGUAGES.map(({ code }) => code))('currículo em %s', (language) => {
  const doc = resume(language);
  const text = doc.body.textContent;

  it('tem nome, cargo do idioma e lang certo', () => {
    expect(doc.querySelector('h1')?.textContent).toBe(profile.name);
    expect(doc.querySelector('.role')?.textContent).toBe(resources[language].common.profile.role);
    expect(doc.documentElement.lang).toBe(language);
  });

  it('tem e-mail, LinkedIn e GitHub', () => {
    const hrefs = [...doc.querySelectorAll('header a')].map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual([
      `mailto:${profile.email}`,
      profile.links.linkedin,
      profile.links.github,
    ]);
  });

  it('traz todas as experiências, projetos e formações do conteúdo', () => {
    const content = CONTENT[language];
    for (const { company } of content.experience) expect(text).toContain(company);
    for (const { title } of content.projects) expect(text).toContain(title);
    for (const { institution } of content.education) expect(text).toContain(institution);
  });

  it('não tem Só Cópias, Hora do Lixo nem telefone', () => {
    expect(findForbidden(doc.documentElement.outerHTML)).toEqual([]);
  });

  it('só o projeto público tem link', () => {
    const projectLinks = [...doc.querySelectorAll('section a')].map((link) =>
      link.getAttribute('href'),
    );

    expect(projectLinks).toEqual([profile.repoUrl]);
  });
});

describe('arquivos dos currículos', () => {
  it('usa os nomes combinados para cada idioma', () => {
    expect(RESUME_FILES).toEqual({
      'pt-BR': 'curriculo-pt-BR.pdf',
      en: 'resume-en.pdf',
      es: 'curriculo-es.pdf',
    });
  });

  it('escapa HTML dos textos', () => {
    const content = structuredClone(CONTENT['pt-BR']);
    const html = buildResumeHtml({
      language: 'pt-BR',
      content: { ...content, about: { paragraphs: ['<script>alert(1)</script>'] } },
      labels: resumeLabels(resources['pt-BR'].common),
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
