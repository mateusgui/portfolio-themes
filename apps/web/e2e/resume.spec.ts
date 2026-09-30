import { expect, test } from '@playwright/test';

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'sidebar fixa só no desktop');

  for (const [lang, name, file] of [
    ['pt-BR', 'Currículo', 'curriculo-pt-BR.pdf'],
    ['en', 'Resume', 'resume-en.pdf'],
    ['es', 'Currículum', 'curriculo-es.pdf'],
  ] as const) {
    test(`${lang === 'en' ? 'CA-09: ' : ''}em ${lang}, o Currículo abre o PDF do idioma em nova aba`, async ({
      page,
      context,
    }) => {
      await page.goto(`/?lang=${lang}`);
      const link = page
        .getByRole('complementary')
        .getByRole('link', { name: new RegExp(`^${name} `) });

      await expect(link).toHaveAttribute('href', `/resume/${file}`);
      await expect(link).toHaveAttribute('target', '_blank');

      const response = await context.request.get(`/resume/${file}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/pdf');
      expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
    });
  }
});
