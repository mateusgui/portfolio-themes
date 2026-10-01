import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { contentSecurityPolicy, headersFile, inlineScriptHashes } from './headers.ts';

const sha = (code: string) => `'sha256-${createHash('sha256').update(code).digest('base64')}'`;

describe('hashes de scripts inline', () => {
  it('pega só scripts inline executáveis, sem repetir', () => {
    const html = `
      <script>tema()</script>
      <script type="application/ld+json">{"@type":"Person"}</script>
      <script type="module" crossorigin src="/assets/index.js"></script>
      <script type="module">modulo()</script>
      <script>tema()</script>`;

    expect(inlineScriptHashes(html)).toEqual([sha('tema()'), sha('modulo()')]);
  });

  it('o hash cobre o conteúdo exato, com espaços e quebras', () => {
    expect(inlineScriptHashes('<script>\n  a();\n</script>')).toEqual([sha('\n  a();\n')]);
  });
});

describe('_headers', () => {
  const csp = contentSecurityPolicy(["'sha256-abc'"]);

  it('CSP estrita: nada externo, sem unsafe-inline, sem iframes', () => {
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'sha256-abc'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain('unsafe');
    expect(csp).not.toMatch(/https?:/);
  });

  it('headers de segurança em todas as rotas e cache imutável só nos assets com hash', () => {
    const file = headersFile(["'sha256-abc'"]);

    expect(file).toMatch(/^\/\*\n {2}Content-Security-Policy: /m);
    for (const header of [
      'Strict-Transport-Security',
      'X-Content-Type-Options: nosniff',
      'X-Frame-Options: DENY',
      'Referrer-Policy',
      'Permissions-Policy',
    ]) {
      expect(file).toContain(header);
    }
    expect(file).toMatch(/^\/assets\/\*\n {2}Cache-Control: public, max-age=31536000, immutable$/m);
    // Cache-Control na regra geral somaria com as específicas e viraria uma lista.
    const general = file.split('\n\n')[0] ?? '';
    expect(general).not.toContain('Cache-Control');
  });
});
