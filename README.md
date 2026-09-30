# Portfólio com temas dinâmicos

Portfólio de desenvolvedor full stack em que o visitante troca a identidade visual da página inteira com um clique, sem recarregar. São cinco temas: Hacker, Retrô, Minimalista, VS Code e Papel.

## Objetivo

O próprio site é a demonstração técnica: design system baseado em tokens, troca instantânea de tema, internacionalização (pt-BR, en e es) com detecção pelo navegador, navegação com scroll spy, acessibilidade (WCAG AA) e testes automatizados.

## Stack

React, Vite, TypeScript (strict), Tailwind CSS com CSS variables, Framer Motion, i18next, Vitest, Testing Library e Playwright.

## Como rodar

> Projeto em construção.

Pré-requisito: Node.js 22.12+ ou 24 (versão do CI em `.nvmrc`). O app fica em `apps/web` (npm workspaces).

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm run check      # formatação, lint, tipos e testes
npx -w web playwright install chromium   # só na primeira vez
npm run test:e2e   # testes e2e (Playwright)
```

Com Docker (opcional):

```bash
docker build -f apps/web/Dockerfile -t portfolio-web .
docker run --rm -p 8080:80 portfolio-web   # http://localhost:8080
```

Variáveis de ambiente: copie `apps/web/.env.example` para `apps/web/.env`. Toda variável `VITE_*` é pública.

## Licença

[MIT](LICENSE)
