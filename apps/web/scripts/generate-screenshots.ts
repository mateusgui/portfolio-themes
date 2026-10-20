/**
 * Gera os prints de cada tema a partir do build de produção: o PNG do README
 * (`docs/screenshots/`, na raiz do repositório) e o WebP que o card deste
 * portfólio mostra no tema correspondente (`public/projetos/`). Rode de novo
 * quando o visual mudar:
 *
 *   npm run screenshots
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { build, preview } from 'vite';

import { THEME_IDS } from '../src/themes/registry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '../../docs/screenshots');
const previewDir = join(root, 'public/projetos');
const PORT = 4180;

/** Metade do viewport: o tamanho declarado em `src/themes/previews.ts`. */
const PREVIEW_WIDTH = 960;

await build({ root, logLevel: 'warn' });
const server = await preview({ root, preview: { port: PORT, strictPort: true } });
const browser = await chromium.launch();

try {
  mkdirSync(outDir, { recursive: true });
  mkdirSync(previewDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'pt-BR',
    // Sem movimento: digitação do Hacker completa, letreiro parado, sem chuva aleatória.
    reducedMotion: 'reduce',
  });

  for (const theme of THEME_IDS) {
    const page = await context.newPage();
    await page.goto(`http://localhost:${String(PORT)}/pt/?tema=${theme}`);
    await page.getByRole('main').waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const path = join(outDir, `${theme}.png`);
    const shot = await page.screenshot({ path });
    console.log(`✓ ${path}`);

    const previewPath = join(previewDir, `portfolio-${theme}.webp`);
    await sharp(shot).resize({ width: PREVIEW_WIDTH }).webp({ quality: 80 }).toFile(previewPath);
    console.log(`✓ ${previewPath}`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise<void>((resolve, reject) => {
    server.httpServer.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
