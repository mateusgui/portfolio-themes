/**
 * Headers HTTP do site publicado (arquivo `_headers` dos static assets da
 * Cloudflare): segurança para todas as rotas e cache por tipo de arquivo.
 */
import { createHash } from 'node:crypto';

/**
 * Hash `sha256-...` de cada `<script>` inline executável do HTML (o script de tema
 * do `index.html`). Blocos de dados, como o JSON-LD, não executam e ficam de fora.
 */
export function inlineScriptHashes(html: string): string[] {
  const hashes = new Set<string>();
  for (const [, attributes = '', body = ''] of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
  )) {
    if (/\bsrc=/.test(attributes)) continue;
    const type = /\btype="([^"]*)"/.exec(attributes)?.[1];
    if (type && type !== 'module' && type !== 'text/javascript') continue;
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
  return [...hashes];
}

/** Content Security Policy: só recursos do próprio site, mais os scripts inline listados. */
export function contentSecurityPolicy(scriptHashes: readonly string[]) {
  return [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(' ')}`.trim(),
    // Estilos só de arquivo: o React aplica `style` via CSSOM, que a CSP não bloqueia.
    "style-src 'self'",
    // Texturas e tiles dos temas são SVG em data URI no CSS.
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/**
 * Conteúdo do `_headers`. Regras que casam com a mesma rota somam os headers, e
 * o mesmo header em duas regras vira uma lista: por isso o `Cache-Control` só
 * aparece nas regras específicas (HTML fica com o padrão, que revalida sempre).
 */
export function headersFile(scriptHashes: readonly string[]) {
  return `# Gerado no build (scripts/headers). Não edite no dist.
/*
  Content-Security-Policy: ${contentSecurityPolicy(scriptHashes)}
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()
  Cross-Origin-Opener-Policy: same-origin

# JS, CSS e fontes têm hash no nome: podem ficar em cache para sempre.
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Nome fixo, conteúdo que muda de vez em quando (novo currículo, nova prévia).
/resume/*
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/og/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

/favicon.svg
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

/apple-touch-icon.png
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
`;
}
