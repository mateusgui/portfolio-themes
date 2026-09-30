import { describe, expect, it } from 'vitest';

import { CONTENT } from './index.ts';
import type { Content } from './types.ts';

const REFERENCE = CONTENT['pt-BR'];
const TRANSLATIONS = [
  ['en', CONTENT.en],
  ['es', CONTENT.es],
] as const;

/** Forma do conteúdo: mesmas chaves, mesmos tamanhos de lista; textos viram "texto". */
function shape(value: unknown): unknown {
  if (typeof value === 'string') return 'texto';
  if (Array.isArray(value)) return value.map(shape);
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, shape(child)]),
    );
  }
  return value;
}

/** Dados que não se traduzem: ids, datas, empresas, stacks, visibilidade e links. */
function neutral(content: Content) {
  return {
    skills: content.skills.map(({ id, items }) => ({ id, count: items.length })),
    projects: content.projects.map(({ id, stack, visibility, repoUrl, images }) => ({
      id,
      stack,
      visibility,
      repoUrl,
      images: images.map(({ src }) => src),
    })),
    experience: content.experience.map(({ id, company, location, start, end, highlights }) => ({
      id,
      company,
      location,
      start,
      end,
      highlights: highlights.length,
    })),
    education: content.education.map(({ id, institution, start, end }) => ({
      id,
      institution,
      start,
      end,
    })),
  };
}

function texts(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(texts);
  if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(texts);
  return [];
}

describe('paridade do conteúdo', () => {
  it.each(TRANSLATIONS)('%s tem a mesma estrutura que pt-BR', (_language, content) => {
    expect(shape(content)).toEqual(shape(REFERENCE));
  });

  it.each(TRANSLATIONS)('%s mantém os dados que não se traduzem', (_language, content) => {
    expect(neutral(content)).toEqual(neutral(REFERENCE));
  });

  it.each(TRANSLATIONS)('%s está traduzido de fato, não copiado do pt-BR', (_language, content) => {
    expect(content.hero.headline).not.toBe(REFERENCE.hero.headline);
    expect(content.about.paragraphs).not.toEqual(REFERENCE.about.paragraphs);
    expect(content.experience.map(({ highlights }) => highlights)).not.toEqual(
      REFERENCE.experience.map(({ highlights }) => highlights),
    );
    expect(content.contact.intro).not.toBe(REFERENCE.contact.intro);
  });

  it.each(Object.entries(CONTENT))('%s não tem textos vazios', (_language, content) => {
    for (const text of texts(content)) {
      expect(text.trim()).not.toBe('');
    }
  });
});
