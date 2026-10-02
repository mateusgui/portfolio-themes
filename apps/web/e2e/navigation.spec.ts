import { expect, test, type Page } from '@playwright/test';

/**
 * Abre a página e espera as fontes: a Inter muda a altura do texto ao carregar,
 * e uma rolagem feita antes disso deixa de estar no fim da página.
 */
async function open(page: Page, url: string) {
  await page.goto(url);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** Item da sidebar com `aria-current`, ou `null`. */
function currentItem(page: Page) {
  return page.evaluate(
    () => document.querySelector('aside [aria-current="location"]')?.textContent ?? null,
  );
}

/** Registra cada item que recebe `aria-current` na sidebar, em ordem. */
async function recordHighlights(page: Page) {
  await page.evaluate(() => {
    const log: string[] = [];
    Object.assign(window, { highlightLog: log });
    new MutationObserver((mutations) => {
      for (const { target } of mutations) {
        if (target instanceof Element && target.getAttribute('aria-current') === 'location') {
          log.push(target.textContent);
        }
      }
    }).observe(document.querySelector('aside') as Element, {
      subtree: true,
      attributeFilter: ['aria-current'],
    });
  });
  return () => page.evaluate(() => (window as unknown as { highlightLog: string[] }).highlightLog);
}

/** Espera dois quadros: callbacks do observer e o render do React já rodaram. */
function nextFrames(page: Page) {
  return page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      }),
  );
}

/** Começa a ouvir o `scrollend` antes da ação; devolve a espera por ele. */
async function listenScrollEnd(page: Page) {
  await page.evaluate(() => {
    Object.assign(window, {
      scrollEnded: new Promise<void>((resolve) => {
        window.addEventListener(
          'scrollend',
          () => {
            resolve();
          },
          { once: true },
        );
      }),
    });
  });
  return () =>
    page.evaluate(() => (window as unknown as { scrollEnded: Promise<void> }).scrollEnded);
}

/** Espera a rolagem da window parar. */
async function waitForScrollToSettle(page: Page) {
  let last = -1;
  await expect
    .poll(async () => {
      const y = await page.evaluate(() => window.scrollY);
      const settled = y === last;
      last = y;
      return settled;
    })
    .toBe(true);
}

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'sidebar fixa só no desktop');

  test('CA-04: clicar em "Projetos" destaca desde o clique, sem piscar "Skills"', async ({
    page,
  }) => {
    await open(page, '/');
    const getLog = await recordHighlights(page);
    const sidebar = page.getByRole('complementary');
    const scrollEnded = await listenScrollEnd(page);

    await sidebar.getByRole('link', { name: 'Projetos' }).click();
    await expect(sidebar.getByRole('link', { name: 'Projetos' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    // Depois do scrollend o observer volta e precisa concordar com o clique.
    await scrollEnded();
    await nextFrames(page);

    expect(await getLog()).toEqual(['Projetos']);
    await expect(page).toHaveURL(/#projetos$/);
    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeInViewport();
  });

  test('CA-05: rolar com o mouse de "Sobre" até "Experiência" acompanha a faixa de leitura', async ({
    page,
  }) => {
    await open(page, '/');
    await page.mouse.move(800, 400);
    const getLog = await recordHighlights(page);

    // Passos curtos, cada um esperando o observer e o render: nenhuma seção é pulada.
    for (let i = 0; i < 100 && (await currentItem(page)) !== 'Experiência'; i++) {
      await page.mouse.wheel(0, 100);
      await nextFrames(page);
    }

    expect(await getLog()).toEqual(['Sobre', 'Skills', 'Projetos', 'Experiência']);
  });

  test('CA-06: no fim da página, "Contato" fica ativo mesmo sendo curta', async ({ page }) => {
    await open(page, '/');
    await page.mouse.move(800, 400);

    await page.mouse.wheel(0, 100_000);

    await expect.poll(() => currentItem(page)).toBe('Contato');
  });

  test('voltar ao topo ativa "Início"', async ({ page }) => {
    await open(page, '/#skills');
    await expect.poll(() => currentItem(page)).toBe('Skills');

    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    await expect.poll(() => currentItem(page)).toBe('Início');
  });

  test('URL com hash abre direto na seção', async ({ page }) => {
    await open(page, '/#experiencia');

    await expect(page.getByRole('heading', { name: 'Experiência' })).toBeInViewport();
    await expect.poll(() => currentItem(page)).toBe('Experiência');
  });

  test('clicar grava o hash sem criar entradas no histórico', async ({ page }) => {
    await open(page, '/');
    const sidebar = page.getByRole('complementary');
    const historyLength = await page.evaluate(() => history.length);

    await sidebar.getByRole('link', { name: 'Skills' }).click();
    await expect(page).toHaveURL(/#skills$/);
    await sidebar.getByRole('link', { name: 'Formação' }).click();
    await expect(page).toHaveURL(/#formacao$/);

    // `replaceState`: o Voltar do navegador não passa por cada seção clicada.
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
  });

  test('o hash continua valendo ao recarregar', async ({ page }) => {
    await open(page, '/');
    await page.getByRole('complementary').getByRole('link', { name: 'Formação' }).click();
    await expect(page).toHaveURL(/#formacao$/);

    await page.reload();

    await expect(page.getByRole('heading', { name: 'Formação', exact: true })).toBeInViewport();
    await expect.poll(() => currentItem(page)).toBe('Formação');
  });

  test('hash que não é de seção é ignorado', async ({ page }) => {
    await open(page, '/#nao-existe');

    await expect.poll(() => currentItem(page)).toBe('Início');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('CA-11: com movimento reduzido, a rolagem é instantânea', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, '/');

    await page.getByRole('complementary').getByRole('link', { name: 'Projetos' }).click();

    const [headingTop, navbarBottom] = await page.evaluate(() => [
      document.getElementById('projetos')?.getBoundingClientRect().top ?? -1,
      document.querySelector('header')?.getBoundingClientRect().bottom ?? -1,
    ]);
    expect(Math.abs(headingTop - navbarBottom)).toBeLessThanOrEqual(1);
  });

  test('a sidebar rola até o item ativo quando ele está fora da área visível', async ({ page }) => {
    // Baixa o bastante para o último item não caber (a sidebar começa direto na navegação).
    await page.setViewportSize({ width: 1280, height: 320 });
    await open(page, '/');
    const sidebar = page.getByRole('complementary');
    const contato = sidebar.getByRole('link', { name: 'Contato' });
    await expect(contato).not.toBeInViewport({ ratio: 1 });

    await page.mouse.move(800, 300);
    await page.mouse.wheel(0, 100_000);

    await expect(contato).toHaveAttribute('aria-current', 'location');
    await expect(contato).toBeInViewport({ ratio: 1 });

    await page.mouse.wheel(0, -100_000);

    await expect(sidebar.getByRole('link', { name: 'Início' })).toBeInViewport({ ratio: 1 });
  });
});

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'drawer só existe no mobile');

  test('URL com hash abre direto na seção', async ({ page }) => {
    await open(page, '/#experiencia');

    await expect(page.getByRole('heading', { name: 'Experiência' })).toBeInViewport();
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Experiência' }),
    ).toHaveAttribute('aria-current', 'location');
  });

  test('navegar pelo drawer foca o título e marca a seção ativa', async ({ page }) => {
    await open(page, '/');
    const menuButton = page.getByRole('button', { name: 'Abrir menu' });

    await menuButton.click();
    await page
      .getByRole('dialog', { name: 'Menu' })
      .getByRole('link', { name: 'Projetos' })
      .click();

    await expect(page.getByRole('heading', { name: 'Projetos' })).toBeFocused();
    await expect(page).toHaveURL(/#projetos$/);

    await waitForScrollToSettle(page);
    await menuButton.click();
    await expect(
      page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Projetos' }),
    ).toHaveAttribute('aria-current', 'location');
  });
});
