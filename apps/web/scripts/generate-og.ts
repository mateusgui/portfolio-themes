/**
 * Gera as imagens de compartilhamento (Open Graph, 1200×630, uma por idioma) e o
 * `apple-touch-icon.png` (a partir do `favicon.svg`), com o Chromium do
 * Playwright. Rode de novo sempre que nome, cargo, frase do Hero ou nomes dos
 * temas mudarem:
 *
 *   npm run og
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import { content as en } from '../src/content/en/index.ts';
import { content as es } from '../src/content/es/index.ts';
import { profile } from '../src/content/profile.ts';
import { content as ptBR } from '../src/content/pt-BR/index.ts';
import type { Content } from '../src/content/types.ts';
import { LANGUAGES, type Language } from '../src/i18n/languages.ts';
import type { ThemeId } from '../src/themes/registry.ts';
import { buildOgHtml } from './og/template.ts';
import { OG_IMAGE, ogImagePath } from './seo/seo.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const require = createRequire(import.meta.url);

const CONTENT: Record<Language, Content> = { 'pt-BR': ptBR, en, es };

interface Common {
  profile: { role: string };
  themes: Record<ThemeId, string>;
}

function readCommon(language: Language) {
  const path = join(root, 'src/i18n/locales', language, 'common.json');
  return JSON.parse(readFileSync(path, 'utf-8')) as Common;
}

function fontUrl(file: string) {
  return `data:font/woff2;base64,${readFileSync(require.resolve(file)).toString('base64')}`;
}

const fonts = {
  inter: fontUrl('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
  mono: fontUrl('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'),
};

const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: OG_IMAGE });
  mkdirSync(join(publicDir, 'og'), { recursive: true });

  for (const { code } of LANGUAGES) {
    const common = readCommon(code);
    await page.setContent(
      buildOgHtml(
        {
          name: profile.name,
          initials: profile.initials,
          role: common.profile.role,
          headline: CONTENT[code].hero.headline,
          themes: common.themes,
        },
        fonts,
      ),
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const path = join(publicDir, ogImagePath(code));
    await page.screenshot({ path, type: 'png' });
    console.log(`✓ ${path}`);
  }

  // Ícone do iOS: o favicon em 180×180, sem cantos (o sistema arredonda).
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
  const svg = readFileSync(join(publicDir, 'favicon.svg'), 'utf-8').replace('rx="14"', 'rx="0"');
  await icon.setContent(
    `<style>*{margin:0}svg{display:block;width:180px;height:180px}</style>${svg}`,
  );
  await icon.screenshot({ path: join(publicDir, 'apple-touch-icon.png'), type: 'png' });
  console.log(`✓ ${join(publicDir, 'apple-touch-icon.png')}`);
} finally {
  await browser.close();
}
