/**
 * Gera os prints de cada tema para o README (`docs/screenshots/`, na raiz do
 * repositório) a partir do build de produção. Rode de novo quando o visual mudar:
 *
 *   npm run screenshots
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import { build, preview } from 'vite';

import { THEME_IDS } from '../src/themes/registry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '../../docs/screenshots');
const PORT = 4180;

await build({ root, logLevel: 'warn' });
const server = await preview({ root, preview: { port: PORT, strictPort: true } });
const browser = await chromium.launch();

try {
  mkdirSync(outDir, { recursive: true });
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
    await page.screenshot({ path });
    console.log(`✓ ${path}`);
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
