import { expect, test, type Locator, type Page } from '@playwright/test';

const RESUMES = [
  ['pt-BR', 'Currículo', 'curriculo-pt-BR.pdf'],
  ['en', 'Resume', 'resume-en.pdf'],
  ['es', 'Currículum', 'curriculo-es.pdf'],
] as const;

/** Link do currículo na sidebar (desktop) ou no drawer (mobile). */
async function resumeLink(page: Page, isMobile: boolean, name: string): Promise<Locator> {
  const label = new RegExp(`^${name} `);
  if (!isMobile) return page.getByRole('complementary').getByRole('link', { name: label });

  // Rótulo do botão de menu no idioma da página.
  await page.locator('header button[aria-controls]').click();
  return page.getByRole('dialog').getByRole('link', { name: label });
}

for (const [lang, name, file] of RESUMES) {
  test(`CA-09: em ${lang}, o Currículo abre o PDF do idioma em nova aba`, async ({
    page,
    context,
    isMobile,
  }) => {
    await page.goto(`/?lang=${lang}`);
    const link = await resumeLink(page, isMobile, name);
    await expect(link).toHaveAttribute('href', `/resume/${file}`);
    await expect(link).toHaveAttribute('rel', /noopener/);

    // Clique de verdade: abre uma nova aba que pede o PDF do idioma. (No Chromium
    // headless o PDF vira download em vez de abrir na aba; a requisição é a prova.)
    const [tab, request] = await Promise.all([
      context.waitForEvent('page'),
      context.waitForEvent('request', (r) => r.url().endsWith(`/resume/${file}`)),
      link.click(),
    ]);
    const response = await request.response();

    expect(request.frame().page()).toBe(tab);
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('application/pdf');
    // O arquivo servido é mesmo um PDF (não o index.html de fallback do SPA).
    const pdf = await (await context.request.get(`/resume/${file}`)).body();
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    // A página do portfólio continua aberta onde estava.
    await expect(page).toHaveURL(/\/$/);
  });
}

test('trocar o idioma troca o PDF do Currículo na hora', async ({ page, isMobile }) => {
  await page.goto('/?lang=pt-BR');
  await page.getByRole('combobox', { name: 'Idioma' }).selectOption('es');

  const link = await resumeLink(page, isMobile, 'Currículum');
  await expect(link).toHaveAttribute('href', '/resume/curriculo-es.pdf');
});
