import type { Plugin } from 'vite';

import { headersFile, inlineScriptHashes } from './headers.ts';

/**
 * Gera o `_headers` (static assets da Cloudflare) com a CSP liberando só o hash
 * dos scripts inline do HTML final. Precisa vir depois do plugin de chunks de
 * tema, que altera o script inline; as páginas de idioma repetem o mesmo script.
 */
export function headersPlugin(): Plugin {
  return {
    name: 'portfolio-headers',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const pages = Object.values(bundle).flatMap((output) =>
        output.type === 'asset' && output.fileName.endsWith('.html') ? [String(output.source)] : [],
      );
      if (pages.length === 0) return;

      const hashes = [...new Set(pages.flatMap(inlineScriptHashes))];
      this.emitFile({ type: 'asset', fileName: '_headers', source: headersFile(hashes) });
    },
  };
}
