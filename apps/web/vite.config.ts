/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { headersPlugin } from './scripts/headers/plugin.ts';
import { seoPlugin } from './scripts/seo/plugin.ts';
import { themeChunksPlugin } from './scripts/themeChunks/plugin.ts';

// Sem `VITE_SITE_URL` (dev, CI), as URLs absolutas apontam para o preview local.
const FALLBACK_SITE_URL = 'http://localhost:4173';

export default defineConfig(({ mode }) => {
  // Variáveis ausentes não aparecem no objeto (o tipo do Vite diz que sempre existem).
  const env: Partial<Record<string, string>> = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = env.VITE_SITE_URL ?? FALLBACK_SITE_URL;
  if (mode === 'production' && siteUrl === FALLBACK_SITE_URL) {
    console.warn(`VITE_SITE_URL não definida: URLs de SEO usam ${FALLBACK_SITE_URL}`);
  }

  return {
    // Ordem: chunks completa o script inline, SEO copia o index.html por idioma e
    // headers calcula a CSP a partir do HTML final.
    plugins: [react(), tailwindcss(), themeChunksPlugin(), seoPlugin(siteUrl), headersPlugin()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
      css: true,
      // Testes de componente renderizam o AppShell inteiro e consultam por papel e
      // nome acessível: levam 1–4 s no jsdom, mais com cobertura ou em CI com 2
      // núcleos. O padrão de 5 s gerava falhas por tempo, não por comportamento.
      testTimeout: 20_000,
      coverage: {
        provider: 'v8',
        // Módulos com meta de cobertura (RNF-06): tema, i18n e navegação.
        include: [
          'src/themes/**/*.{ts,tsx}',
          'src/i18n/**/*.ts',
          'src/hooks/**/*.ts',
          'src/layout/**/*.tsx',
          'src/layout/**/*.ts',
        ],
        exclude: ['**/*.test.{ts,tsx}'],
        reporter: ['text', 'html', 'json-summary'],
        thresholds: {
          'src/themes/**': { lines: 80, functions: 80, branches: 80, statements: 80 },
          'src/i18n/**': { lines: 80, functions: 80, branches: 80, statements: 80 },
          'src/{hooks,layout}/**': { lines: 80, functions: 80, branches: 80, statements: 80 },
        },
      },
    },
  };
});
