import { describe, expect, it } from 'vitest';

const sheets = import.meta.glob<string>('./tokens/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Tokens `--theme-*` com cor hexadecimal declarados num arquivo de tema. */
function colorTokens(css: string) {
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(/--theme-([\w-]+):\s*(#[0-9a-f]{3,6})\s*;/gi)) {
    const [, name, value] = match;
    if (name && value) tokens[name] = value;
  }
  return tokens;
}

function luminance(hex: string) {
  const digits = hex.slice(1);
  const full = digits.length === 3 ? digits.replace(/./g, '$&$&') : digits;
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((start) => {
    const channel = parseInt(full.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [first, second] = [luminance(a), luminance(b)];
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

// Pares de texto sobre fundo que os componentes usam.
const PAIRS = [
  ['fg', 'bg'],
  ['fg', 'surface'],
  ['fg', 'surface-alt'],
  ['muted', 'bg'],
  ['muted', 'surface'],
  ['muted', 'surface-alt'],
  ['accent', 'surface-alt'],
  ['accent-fg', 'accent'],
] as const;

const themeSheets = Object.entries(sheets).filter(([path]) => !path.endsWith('/tokens.css'));

describe('contraste WCAG AA dos temas', () => {
  it('existe pelo menos um tema com tokens', () => {
    expect(themeSheets.length).toBeGreaterThan(0);
  });

  describe.each(themeSheets)('%s', (_path, css) => {
    const tokens = colorTokens(css);

    it.each(PAIRS)('%s sobre %s tem contraste de pelo menos 4.5:1', (text, background) => {
      const fg = tokens[text];
      const bg = tokens[background];
      if (!fg || !bg) throw new Error(`Faltam os tokens --theme-${text} ou --theme-${background}`);
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
