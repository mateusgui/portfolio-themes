import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { findForbidden } from '../../src/content/forbidden.ts';
import { resources } from '../../src/i18n/index.ts';
import { LANGUAGES, LANGUAGE_PATHS } from '../../src/i18n/languages.ts';
import { replaceSeoBlock } from './plugin.ts';
import {
  OG_IMAGE,
  buildHead,
  normalizeSiteUrl,
  ogImagePath,
  robotsTxt,
  sitemapXml,
  sitePaths,
} from './seo.ts';

const SITE = 'https://exemplo.dev';
const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function parseHead(head: string) {
  const document = new DOMParser().parseFromString(`<head>${head}</head>`, 'text/html');
  const meta = (selector: string) =>
    document.querySelector(`meta[${selector}]`)?.getAttribute('content');
  return { document, meta };
}

describe.each(LANGUAGES.map(({ code }) => code))('head em %s', (language) => {
  const path = LANGUAGE_PATHS[language];
  const head = buildHead({ language, path, siteUrl: `${SITE}/` });
  const { document, meta } = parseHead(head);
  const { meta: texts } = resources[language].common;

  it('title e description no idioma', () => {
    expect(document.title).toBe(texts.title);
    expect(meta('name="description"')).toBe(texts.description);
    expect(meta('property="og:title"')).toBe(texts.title);
    expect(meta('name="twitter:description"')).toBe(texts.description);
  });

  it('canonical na própria página e hreflang para todos os idiomas e x-default', () => {
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE}${path}`,
    );
    const alternates = [...document.querySelectorAll('link[rel="alternate"]')].map((link) => [
      link.getAttribute('hreflang'),
      link.getAttribute('href'),
    ]);
    expect(alternates).toEqual([
      ['pt-BR', `${SITE}/pt/`],
      ['en', `${SITE}/en/`],
      ['es', `${SITE}/es/`],
      ['x-default', `${SITE}/`],
    ]);
  });

  it('prévia de compartilhamento com imagem do idioma', () => {
    expect(meta('property="og:url"')).toBe(`${SITE}${path}`);
    expect(meta('property="og:image"')).toBe(`${SITE}${ogImagePath(language)}`);
    expect(meta('name="twitter:card"')).toBe('summary_large_image');
    expect(meta('property="og:image:alt"')).toBeTruthy();
  });

  it('JSON-LD Person válido, só com dados públicos', () => {
    const script = document.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent ?? '') as Record<string, unknown>;

    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Mateus Guimarães Moraes Vilela');
    expect(data.jobTitle).toBe(resources[language].common.profile.role);
    expect(data.sameAs).toEqual([
      'https://www.linkedin.com/in/mateusguimaraesmoraes',
      'https://github.com/mateusgui',
    ]);
    expect(data).not.toHaveProperty('telephone');
    expect(findForbidden(head)).toEqual([]);
  });
});

describe('arquivos de SEO', () => {
  it('normaliza a URL do site', () => {
    expect(normalizeSiteUrl(' https://exemplo.dev/// ')).toBe(SITE);
  });

  it('robots.txt libera tudo e aponta o sitemap', () => {
    expect(robotsTxt(SITE)).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  });

  it('sitemap lista a raiz e as páginas de idioma, com alternativas', () => {
    const xml = new DOMParser().parseFromString(sitemapXml(SITE), 'application/xml');
    const locs = [...xml.getElementsByTagName('loc')].map((loc) => loc.textContent);

    expect(sitePaths()).toEqual(['/', '/pt/', '/en/', '/es/']);
    expect(locs).toEqual([`${SITE}/`, `${SITE}/pt/`, `${SITE}/en/`, `${SITE}/es/`]);
    expect(xml.getElementsByTagName('xhtml:link')).toHaveLength(4 * 4);
  });

  it('troca só o bloco de SEO do HTML', () => {
    const html = '<head><!-- seo:start -->antigo<!-- seo:end --><script></script></head>';

    expect(replaceSeoBlock(html, 'novo')).toBe(
      '<head><!-- seo:start -->\n    novo\n    <!-- seo:end --><script></script></head>',
    );
  });

  it('o script inline do index.html conhece os mesmos caminhos de idioma', () => {
    const indexHtml = readFileSync(join(root, 'index.html'), 'utf-8');

    for (const { code } of LANGUAGES) {
      expect(indexHtml).toContain(`'${LANGUAGE_PATHS[code]}': '${code}'`);
    }
    expect(indexHtml).toContain('<!-- seo -->');
  });

  it.each(LANGUAGES.map(({ code }) => code))('imagem de compartilhamento de %s existe', (code) => {
    const png = readFileSync(join(root, 'public', ogImagePath(code)));
    // Largura e altura ficam no cabeçalho IHDR do PNG (bytes 16 a 23).
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([OG_IMAGE.width, OG_IMAGE.height]);
  });
});
