/**
 * SEO do site: `<head>` de cada página de idioma, `robots.txt` e `sitemap.xml`.
 * Funções puras, usadas pelo plugin do Vite (`plugin.ts`) no build e no dev.
 */
import { content as en } from '../../src/content/en/index.ts';
import { content as es } from '../../src/content/es/index.ts';
import { profile } from '../../src/content/profile.ts';
import { content as ptBR } from '../../src/content/pt-BR/index.ts';
import type { Content } from '../../src/content/types.ts';
import enCommon from '../../src/i18n/locales/en/common.json' with { type: 'json' };
import esCommon from '../../src/i18n/locales/es/common.json' with { type: 'json' };
import ptBRCommon from '../../src/i18n/locales/pt-BR/common.json' with { type: 'json' };
import { LANGUAGES, LANGUAGE_PATHS, type Language } from '../../src/i18n/languages.ts';

const COMMON: Record<Language, typeof ptBRCommon> = {
  'pt-BR': ptBRCommon,
  en: enCommon,
  es: esCommon,
};
const CONTENT: Record<Language, Content> = { 'pt-BR': ptBR, en, es };

const OG_LOCALES: Record<Language, string> = { 'pt-BR': 'pt_BR', en: 'en_US', es: 'es_ES' };

/** Imagem de compartilhamento (gerada por `npm run og`). */
export const OG_IMAGE = { width: 1200, height: 630 } as const;

export function ogImagePath(language: Language) {
  return `/og/og-${language}.png`;
}

/** A raiz detecta o idioma (`x-default`); cada idioma tem a sua página. */
export const ROOT_PATH = '/';

/** `https://site.com/` → `https://site.com` (as rotas já começam com `/`). */
export function normalizeSiteUrl(url: string) {
  return url.trim().replace(/\/+$/, '');
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** JSON dentro de `<script>`: `<` escapado para nenhum texto fechar a tag. */
function inlineJson(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function personJsonLd(language: Language, pageUrl: string) {
  const [locality, region] = profile.location.split(',').map((part) => part.trim());
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: COMMON[language].profile.role,
    description: COMMON[language].meta.description,
    url: pageUrl,
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressRegion: region,
      addressCountry: 'BR',
    },
    sameAs: [profile.links.linkedin, profile.links.github],
    knowsAbout: CONTENT[language].skills.flatMap(({ items }) => items),
  };
}

interface HeadOptions {
  language: Language;
  /** Caminho da página: `/` (raiz) ou o de um idioma (`/en/`). */
  path: string;
  siteUrl: string;
}

/** Tags do `<head>` de uma página: title, description, canonical, hreflang, OG, Twitter e JSON-LD. */
export function buildHead({ language, path, siteUrl }: HeadOptions): string {
  const site = normalizeSiteUrl(siteUrl);
  const { meta, profile: texts } = COMMON[language];
  const pageUrl = `${site}${path}`;
  const image = `${site}${ogImagePath(language)}`;
  const imageAlt = `${profile.name}: ${texts.role}`;

  const alternates = [
    ...LANGUAGES.map(({ code }) => [code, `${site}${LANGUAGE_PATHS[code]}`] as const),
    ['x-default', `${site}${ROOT_PATH}`] as const,
  ];

  const tag = (name: string, attributes: Record<string, string>) =>
    `<${name} ${Object.entries(attributes)
      .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
      .join(' ')} />`;
  const property = (key: string, value: string) => tag('meta', { property: key, content: value });
  const named = (key: string, value: string) => tag('meta', { name: key, content: value });

  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    named('description', meta.description),
    tag('link', { rel: 'canonical', href: pageUrl }),
    ...alternates.map(([hreflang, href]) => tag('link', { rel: 'alternate', hreflang, href })),
    tag('link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }),
    tag('link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }),
    property('og:type', 'website'),
    property('og:site_name', profile.name),
    property('og:title', meta.title),
    property('og:description', meta.description),
    property('og:url', pageUrl),
    property('og:locale', OG_LOCALES[language]),
    ...LANGUAGES.filter(({ code }) => code !== language).map(({ code }) =>
      property('og:locale:alternate', OG_LOCALES[code]),
    ),
    property('og:image', image),
    property('og:image:type', 'image/png'),
    property('og:image:width', String(OG_IMAGE.width)),
    property('og:image:height', String(OG_IMAGE.height)),
    property('og:image:alt', imageAlt),
    named('twitter:card', 'summary_large_image'),
    named('twitter:title', meta.title),
    named('twitter:description', meta.description),
    named('twitter:image', image),
    named('twitter:image:alt', imageAlt),
    `<script type="application/ld+json">${inlineJson(personJsonLd(language, pageUrl))}</script>`,
  ].join('\n    ');
}

/** Todas as páginas indexáveis: a raiz e uma por idioma. */
export function sitePaths() {
  return [ROOT_PATH, ...LANGUAGES.map(({ code }) => LANGUAGE_PATHS[code])];
}

export function robotsTxt(siteUrl: string) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${normalizeSiteUrl(siteUrl)}/sitemap.xml\n`;
}

/** Sitemap com as alternativas de idioma de cada página (`xhtml:link`). */
export function sitemapXml(siteUrl: string) {
  const site = normalizeSiteUrl(siteUrl);
  const alternates = [
    ...LANGUAGES.map(
      ({ code }) =>
        `    <xhtml:link rel="alternate" hreflang="${code}" href="${site}${LANGUAGE_PATHS[code]}" />`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${site}${ROOT_PATH}" />`,
  ].join('\n');

  const urls = sitePaths()
    .map((path) => `  <url>\n    <loc>${site}${path}</loc>\n${alternates}\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}
