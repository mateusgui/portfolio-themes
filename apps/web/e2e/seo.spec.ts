import { expect, test } from '@playwright/test';

test('a raiz tem head em pt-BR, hreflang e JSON-LD', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="alternate"]')).toHaveCount(4);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    'href',
    /\/$/,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /\/og\/og-pt-BR\.png$/,
  );
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(jsonLd ?? '')).toMatchObject({ '@type': 'Person' });
});

for (const [path, lang, title, heading] of [
  ['/en/', 'en', 'Mateus Guimarães | Full Stack Developer', 'About'],
  ['/es/', 'es', 'Mateus Guimarães | Desarrollador Full Stack', 'Sobre mí'],
  ['/pt/', 'pt-BR', 'Mateus Guimarães | Desenvolvedor Full Stack', 'Sobre'],
] as const) {
  test(`${path} abre em ${lang}, salva a escolha e volta para /`, async ({ page, request }) => {
    // O HTML servido (o que scrapers de prévia leem) já vem no idioma.
    const html = await (await request.get(path)).text();
    expect(html).toContain(`<html lang="${lang}">`);
    expect(html).toContain(`<title>${title}</title>`);
    expect(html).toContain(`/og/og-${lang}.png`);

    await page.goto(path);

    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
    expect(await page.evaluate(() => localStorage.getItem('portfolio:lang'))).toBe(lang);
  });
}

test('o tema do link vale também nas páginas de idioma', async ({ page }) => {
  await page.goto('/es/?tema=paper#contato');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe('/');
  expect(new URL(page.url()).hash).toBe('#contato');
});

test('robots.txt, sitemap, ícones e imagens de prévia são servidos', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toMatch(/^User-agent: \*\nAllow: \/\n\nSitemap: .*\/sitemap\.xml/);

  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(4);

  for (const file of [
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/og/og-pt-BR.png',
    '/og/og-en.png',
    '/og/og-es.png',
  ]) {
    const response = await request.get(file);
    expect(response.status(), file).toBe(200);
    expect(response.headers()['content-type'], file).toMatch(/^image\//);
  }
});

test('o chunk do tema ativo é pedido junto com o JS principal', async ({ page }) => {
  await page.goto('/?tema=vscode');

  await expect(page.locator('link[rel="modulepreload"][href*="/assets/vscode-"]')).toHaveCount(1);
  await expect(page.getByTestId('status-bar')).toBeAttached();
});
