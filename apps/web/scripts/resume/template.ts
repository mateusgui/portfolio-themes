import { profile } from '../../src/content/profile.ts';
import type { Content } from '../../src/content/types.ts';
import { formatPeriod } from '../../src/i18n/format.ts';
import type { Language } from '../../src/i18n/languages.ts';
import type commonPtBR from '../../src/i18n/locales/pt-BR/common.json';

type CommonTranslations = typeof commonPtBR;

/** Rótulos do currículo, tirados das traduções da interface (`common.json`). */
export interface ResumeLabels {
  role: string;
  summary: string;
  experience: string;
  projects: string;
  skills: string;
  education: string;
  private: string;
  present: string;
}

/** Monta os rótulos a partir do `common.json` de um idioma. */
export function resumeLabels(common: CommonTranslations): ResumeLabels {
  return {
    role: common.profile.role,
    summary: common.sections.sobre,
    experience: common.sections.experiencia,
    projects: common.sections.projetos,
    skills: common.sections.skills,
    education: common.sections.formacao,
    private: common.projects.private,
    present: common.dates.present,
  };
}

interface ResumeInput {
  language: Language;
  content: Content;
  labels: ResumeLabels;
  /** Inter em `data:` URL, para o PDF não depender de fontes do sistema. */
  fontUrl?: string;
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '');
}

const STYLES = `
  @page { size: A4; margin: 14mm 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; font-size: 9.5pt; line-height: 1.45; color: black; }
  a { color: inherit; text-decoration: none; }
  header { border-bottom: 1.5pt solid black; padding-bottom: 8pt; margin-bottom: 10pt; }
  h1 { font-size: 20pt; line-height: 1.15; letter-spacing: -0.01em; }
  .role { font-size: 11.5pt; font-weight: 600; margin-top: 2pt; }
  .contact { margin-top: 5pt; display: flex; flex-wrap: wrap; gap: 3pt 12pt; }
  section { margin-top: 10pt; }
  h2 { break-after: avoid; font-size: 10pt; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 0.5pt solid black; padding-bottom: 2pt; margin-bottom: 5pt; }
  h3 { font-size: 10pt; }
  .entry { margin-top: 6pt; break-inside: avoid; }
  .entry:first-of-type { margin-top: 0; }
  .meta { display: flex; justify-content: space-between; gap: 8pt; }
  .muted { font-style: italic; }
  ul { margin: 3pt 0 0 12pt; }
  li { margin-top: 1.5pt; }
  p + p { margin-top: 4pt; }
  .keep { break-inside: avoid; }
  .skills { display: grid; grid-template-columns: max-content 1fr; gap: 2pt 10pt; }
  .skills dt { font-weight: 600; }
`;

/** HTML do currículo de um idioma, pronto para imprimir em PDF. */
export function buildResumeHtml({ language, content, labels, fontUrl }: ResumeInput) {
  const period = (
    start: Parameters<typeof formatPeriod>[0],
    end: Parameters<typeof formatPeriod>[1],
  ) => escapeHtml(formatPeriod(start, end, language, labels.present));

  const fontFace = fontUrl
    ? `@font-face { font-family: 'Inter'; src: url('${fontUrl}') format('woff2'); font-weight: 100 900; }`
    : '';

  const contact = [
    `<a href="mailto:${profile.email}">${escapeHtml(profile.email)}</a>`,
    `<a href="${profile.links.linkedin}">${escapeHtml(displayUrl(profile.links.linkedin))}</a>`,
    `<a href="${profile.links.github}">${escapeHtml(displayUrl(profile.links.github))}</a>`,
    `<span>${escapeHtml(profile.location)}</span>`,
  ].join('');

  const experience = content.experience
    .map(
      (entry) => `
      <div class="entry">
        <div class="meta">
          <h3>${escapeHtml(entry.role)} · ${escapeHtml(entry.company)}</h3>
          <span>${period(entry.start, entry.end)}</span>
        </div>
        <p class="muted">${escapeHtml(entry.location)}</p>
        <ul>${entry.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>`,
    )
    .join('');

  const projects = content.projects
    .map(
      (project) => `
      <div class="entry">
        <h3>${escapeHtml(project.title)}${
          project.visibility === 'private'
            ? ` <span class="muted">(${escapeHtml(labels.private)})</span>`
            : ''
        }</h3>
        <p>${escapeHtml(project.description)}</p>
        <p class="muted">${project.stack.map(escapeHtml).join(' · ')}</p>
        ${
          project.visibility === 'public' && project.repoUrl
            ? `<p><a href="${project.repoUrl}">${escapeHtml(displayUrl(project.repoUrl))}</a></p>`
            : ''
        }
      </div>`,
    )
    .join('');

  const skills = content.skills
    .map(
      (group) =>
        `<dt>${escapeHtml(group.title)}</dt><dd>${group.items.map(escapeHtml).join(', ')}</dd>`,
    )
    .join('');

  const education = content.education
    .map(
      (entry) => `
      <div class="entry">
        <div class="meta">
          <h3>${escapeHtml(entry.course)}</h3>
          <span>${period(entry.start, entry.end)}</span>
        </div>
        <p>${[entry.degree, entry.institution]
          .filter(Boolean)
          .map((text) => escapeHtml(text ?? ''))
          .join(' · ')}</p>
      </div>`,
    )
    .join('');

  return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(profile.name)} · ${escapeHtml(labels.role)}</title>
<style>${fontFace}${STYLES}</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(profile.name)}</h1>
    <p class="role">${escapeHtml(labels.role)}</p>
    <p class="contact">${contact}</p>
  </header>
  <section>
    <h2>${escapeHtml(labels.summary)}</h2>
    ${content.about.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
  </section>
  <section>
    <h2>${escapeHtml(labels.experience)}</h2>
    ${experience}
  </section>
  <section>
    <h2>${escapeHtml(labels.projects)}</h2>
    ${projects}
  </section>
  <section class="keep">
    <h2>${escapeHtml(labels.skills)}</h2>
    <dl class="skills">${skills}</dl>
  </section>
  <section class="keep">
    <h2>${escapeHtml(labels.education)}</h2>
    ${education}
  </section>
</body>
</html>`;
}
