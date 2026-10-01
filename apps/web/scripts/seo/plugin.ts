import type { Plugin } from 'vite';

import { LANGUAGES, LANGUAGE_PATHS } from '../../src/i18n/languages.ts';
import { ROOT_PATH, buildHead, robotsTxt, sitemapXml } from './seo.ts';

/** Marcador no `index.html` onde entram as tags de SEO. */
const PLACEHOLDER = '<!-- seo -->';
const START = '<!-- seo:start -->';
const END = '<!-- seo:end -->';

function wrap(head: string) {
  return `${START}\n    ${head}\n    ${END}`;
}

/** Troca o bloco entre os marcadores (inclusive) por outro `<head>`. */
export function replaceSeoBlock(html: string, head: string) {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start === -1 || end === -1) throw new Error('index.html final sem o bloco de SEO');
  return html.slice(0, start) + wrap(head) + html.slice(end + END.length);
}

/**
 * Preenche o `<head>` da raiz (pt-BR, `x-default`) e, no build, gera uma página
 * por idioma (`/pt/`, `/en/`, `/es/`) com o `<head>` traduzido, além de
 * `robots.txt` e `sitemap.xml`.
 */
export function seoPlugin(siteUrl: string): Plugin {
  return {
    name: 'portfolio-seo',
    // Depois do plugin de HTML do Vite: o `index.html` final já está no bundle.
    enforce: 'post',
    transformIndexHtml(html) {
      if (!html.includes(PLACEHOLDER)) throw new Error(`index.html sem o marcador ${PLACEHOLDER}`);
      return html.replace(
        PLACEHOLDER,
        wrap(buildHead({ language: 'pt-BR', path: ROOT_PATH, siteUrl })),
      );
    },
    generateBundle(_options, bundle) {
      if (!('index.html' in bundle)) return;
      const index = bundle['index.html'];
      if (index.type !== 'asset') return;
      const html = String(index.source);

      for (const { code } of LANGUAGES) {
        const path = LANGUAGE_PATHS[code];
        const page = replaceSeoBlock(html, buildHead({ language: code, path, siteUrl })).replace(
          /<html lang="[^"]*">/,
          `<html lang="${code}">`,
        );
        this.emitFile({ type: 'asset', fileName: `${path.slice(1)}index.html`, source: page });
      }

      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(siteUrl) });
    },
  };
}
