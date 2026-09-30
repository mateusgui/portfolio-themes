/**
 * Gera os currículos em PDF (pt-BR, en, es) a partir de `src/content/`, com o
 * Chromium do Playwright. Rode de novo sempre que o conteúdo mudar:
 *
 *   npm run resume
 *
 * Primeira vez: `npx playwright install chromium`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import { findForbidden } from '../src/content/forbidden.ts';
import { content as en } from '../src/content/en/index.ts';
import { content as es } from '../src/content/es/index.ts';
import { RESUME_FILES } from '../src/content/profile.ts';
import { content as ptBR } from '../src/content/pt-BR/index.ts';
import type { Content } from '../src/content/types.ts';
import type { Language } from '../src/i18n/languages.ts';
import { buildResumeHtml, resumeLabels } from './resume/template.ts';

const MAX_PAGES = 2;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const CONTENT: Record<Language, Content> = { 'pt-BR': ptBR, en, es };

function readCommon(language: Language) {
  const path = join(root, 'src/i18n/locales', language, 'common.json');
  return JSON.parse(readFileSync(path, 'utf-8')) as Parameters<typeof resumeLabels>[0];
}

function interFontUrl() {
  const path = require.resolve('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
  return `data:font/woff2;base64,${readFileSync(path).toString('base64')}`;
}

/** Páginas do PDF gerado pelo Chromium (objetos `/Type /Page`). */
function countPages(pdf: Buffer) {
  return pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
}

const browser = await chromium.launch();
const fontUrl = interFontUrl();
let failed = false;

try {
  for (const [language, content] of Object.entries(CONTENT) as [Language, Content][]) {
    const html = buildResumeHtml({
      language,
      content,
      labels: resumeLabels(readCommon(language)),
      fontUrl,
    });

    const forbidden = findForbidden(html.replace(fontUrl, ''));
    if (forbidden.length > 0) {
      console.error(`✗ ${language}: conteúdo proibido no currículo: ${forbidden.join(', ')}`);
      failed = true;
      continue;
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.close();

    const pages = countPages(pdf);
    if (pages < 1 || pages > MAX_PAGES) {
      console.error(
        `✗ ${language}: ${String(pages)} páginas (esperado de 1 a ${String(MAX_PAGES)})`,
      );
      failed = true;
      continue;
    }

    const file = join(root, 'public/resume', RESUME_FILES[language]);
    writeFileSync(file, pdf);
    console.log(`✓ ${language}: ${RESUME_FILES[language]} (${String(pages)} página(s))`);
  }
} finally {
  await browser.close();
}

if (failed) process.exit(1);
