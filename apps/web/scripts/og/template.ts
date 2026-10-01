/**
 * HTML da imagem de compartilhamento (1200×630) de um idioma: nome, cargo, frase
 * do Hero e uma amostra de cada tema com as cores dele. Função pura, renderizada
 * pelo `generate-og.ts`.
 */
import type { ThemeId } from '../../src/themes/registry.ts';

export interface OgTexts {
  name: string;
  initials: string;
  role: string;
  headline: string;
  themes: Record<ThemeId, string>;
}

// Cores de cada tema (as mesmas dos tokens), para a amostra na imagem.
const SWATCHES: Record<ThemeId, { bg: string; fg: string; font: string; border: string }> = {
  hacker: { bg: '#000000', fg: '#00ff41', font: "'JetBrains Mono', monospace", border: '#0f6b22' },
  retro: { bg: '#c0c0c0', fg: '#0000ee', font: "'Comic Sans MS', cursive", border: '#808080' },
  minimal: { bg: '#ffffff', fg: '#4338ca', font: "'Inter', sans-serif", border: '#d8dce2' },
  vscode: { bg: '#252526', fg: '#4daafc', font: "'JetBrains Mono', monospace", border: '#3c3c3c' },
  paper: { bg: '#fbf6e8', fg: '#1f3b8f', font: 'Georgia, serif', border: '#b9a88a' },
};

function escapeHtml(text: string) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function buildOgHtml(texts: OgTexts, fonts: { inter: string; mono: string }) {
  const swatches = (Object.keys(SWATCHES) as ThemeId[])
    .map((id) => {
      const { bg, fg, font, border } = SWATCHES[id];
      return `<li style="background:${bg};color:${fg};font-family:${font};border-color:${border}">${escapeHtml(texts.themes[id])}</li>`;
    })
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Inter'; src: url(${fonts.inter}) format('woff2'); font-weight: 100 900; }
  @font-face { font-family: 'JetBrains Mono'; src: url(${fonts.mono}) format('woff2'); font-weight: 100 900; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; }
  body {
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 72px 80px; background: #f7f7f8; color: #1f2328; font-family: 'Inter', sans-serif;
    border-top: 12px solid #4338ca;
  }
  header { display: flex; align-items: center; gap: 24px; }
  .badge {
    display: grid; place-items: center; width: 88px; height: 88px; border-radius: 22px;
    background: #4338ca; color: #ffffff; font-size: 38px; font-weight: 700;
  }
  h1 { font-size: 60px; line-height: 1.05; letter-spacing: -0.02em; }
  .role { margin-top: 8px; font-size: 30px; font-weight: 600; color: #4338ca; }
  .headline { max-width: 960px; font-size: 34px; line-height: 1.3; color: #3b4048; }
  ul { display: flex; gap: 14px; list-style: none; }
  li { padding: 12px 22px; border: 2px solid; border-radius: 10px; font-size: 24px; font-weight: 600; }
</style>
</head>
<body>
  <header>
    <div class="badge">${escapeHtml(texts.initials)}</div>
    <div>
      <h1>${escapeHtml(texts.name)}</h1>
      <p class="role">${escapeHtml(texts.role)}</p>
    </div>
  </header>
  <p class="headline">${escapeHtml(texts.headline)}</p>
  <ul>${swatches}</ul>
</body>
</html>`;
}
