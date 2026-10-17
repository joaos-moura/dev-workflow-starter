# Reveal e movimento reduzido

Conteúdo visível por padrão. `.mov` no `<html>` só entra quando há
`IntersectionObserver` (`src/movimento.ts`). Reduce troca deslocamento por fade
curto; **não** zera animação no seletor universal.

## Sub-features

- `.rv` / `.vis` nos títulos e blocos (`Revelar`, `Secao`).
- Portal, radar e tabela com stagger; pipeline com tokens `.lane.a .tok` e
  `.lane.b .tok`.
- Dois `@media (prefers-reduced-motion: reduce)`: um geral, um da calculadora
  (`.barras i`).
- Fallback de 1500 ms se o observador não responder.

## How to get to it (user POV)

1. Abrir a home com movimento normal: blocos revelam ao cruzar 15% da tela.
2. Emular reduce no DevTools (Rendering → prefers-reduced-motion) ou no
   Playwright (`reducedMotion: "reduce"`).
3. Ir até `#pipeline`: o token ainda se move, mais devagar.

## Driving it with Playwright

```js
test.use({ reducedMotion: "reduce" });
await page.goto("./#pipeline");
await expect(page.locator("#pipeline h2")).toHaveCSS("opacity", "1");
const nome = await page
  .locator("#pipeline .lane.a .tok")
  .evaluate((el) => getComputedStyle(el).animationName);
expect(nome).not.toBe("none");
```

Isso vive em `e2e/movimento.e2e.ts` e em `drive.mjs movimento`. O CSS é
varrido em `src/invariantes/estilo.test.ts`: qualquer `* { animation: none }`
quebra o teste.

## Gotchas

- Não coloque `animation: none` / `transition: none` em `*`, `*::before` ou
  `*::after`. Esse foi o #12. O teste e o e2e da pipeline pegam o regresso.
- `opacity: 0` só pode aparecer debaixo de `.mov` (e no `.done` da demo). Ver
  `src/movimento.test.tsx`.
- Sem `!important` global. A calculadora tem bloco reduce próprio depois do
  bloco principal — não misture os dois.
- Doctor já exige `h1` com `opacity: 1` sem esperar o observador.
