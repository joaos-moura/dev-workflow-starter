# Âncoras e navegação

Menu fixo, `scroll-margin-top: var(--altura-nav)` (61px), rolagem na primeira
carga em `src/ancora.ts`.

## Sub-features

- `nav` `Seções` com `#desafio` `#solucao` `#portal` `#arquitetura` `#pipeline`
  `#radar` `#custos` `#usar`.
- Logo vai para `#topo`. O botão **Usar template** vai para `#usar`.
- `#futuro` existe na página (Hoje x Futuro) mas **não** está no menu; o e2e
  inclui esse hash na lista.
- `rolarParaHashInicial` depois do render e de `document.fonts.ready`. Com
  reduce, o comportamento é `instant`.

## How to get to it (user POV)

1. Abrir a home.
2. Clicar um link do menu, **ou**
3. Entrar já com hash: `/dev-workflow-starter/#custos`.

O bug antigo: o navegador rolava com o HTML vazio, o React montava depois, a
página ficava no topo.

## Driving it with Playwright

O e2e é a fonte: `e2e/ancora.e2e.ts`, também via `scripts/e2e.sh`.

```js
await page.goto("./#custos");
await expect.poll(() => distanciaDaBarra(page, "#custos")).toBeLessThan(2);
await expect(page.locator("#custos h2")).toHaveCSS("opacity", "1");
```

`drive.mjs ancoras` percorre os hrefs do menu. Roda em 1440 e 390, com e sem
reduce.

## Gotchas

- Meça a distância **barra × topo da seção**, não `scrollY`. A barra é sticky.
- Com reduce não pode haver frames intermediários de `scrollY` — o e2e grava
  `window.__rolagens`.
- Inclua `#futuro` mesmo fora do menu: a seção existe e a carga direta precisa
  funcionar.
- `App.test.tsx` trava a lista de hrefs; se mudar o menu, mude o teste e o e2e.
