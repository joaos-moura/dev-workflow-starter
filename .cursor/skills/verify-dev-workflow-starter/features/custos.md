# Custos

Seção 11, `#custos`. Compara o Azure DevOps de hoje (fixo) com o GitHub
configurável.

## Sub-features

- Destaque de capacidade: ADO `1 hosted + 3 self-hosted = até 4 jobs simultâneos`;
  GitHub Team `3.000 minutos inclusos + 60 jobs simultâneos`.
- Grupo fixo `Azure DevOps · Cenário atual` (sem input).
- Formulário `GitHub`: pessoas, plano, minutos, runner, GHAS, câmbio.
- GHAS desligado por padrão; `data-testid="upgrade-ghas"` mostra o preço
  calculado (`+US$ 980,00/mês com Code Security + Secret Protection` no padrão).
- Totais `data-testid="mensal-az"` / `mensal-gh` (US$ 160,00 e US$ 80,00 no padrão).

## How to get to it (user POV)

1. Abrir `http://127.0.0.1:4173/dev-workflow-starter/`.
2. Clicar **Custos** na `nav` `Seções`, ou entrar direto em `#custos`.
3. Ler o cenário Azure (não há campo para editar) e mudar só o lado GitHub.

## Driving it with Playwright

```js
await page.goto("./#custos");
await expect(page.locator("#custos h2")).toBeVisible();
await expect(page.getByTestId("mensal-az")).toContainText("160,00");
await expect(page.getByTestId("mensal-gh")).toContainText("80,00");
await expect(page.getByRole("switch", { name: /GHAS ligado/ })).not.toBeChecked();
await expect(page.getByTestId("upgrade-ghas")).toContainText("980,00");
await page.getByRole("form", { name: "GitHub" }).getByText("Enterprise", { exact: true }).click();
await expect(page.getByTestId("capacidade-gh")).toContainText("50.000");
```

O helper faz esse caminho: `node scripts/drive.mjs custos`.

## Gotchas

- O bloco Azure é `role="group"`, não `<section>` — uma `<section>` extra quebra
  a contagem das doze seções.
- Radio e switch visualmente escondidos: clique o **rótulo** (`label.chave` ou
  `getByText("Enterprise", { exact: true })`), nunca o input.
- `upgrade-ghas` some quando o GHAS liga; o preço entra no `mensal-gh`.
- Não existe setter de teste. Mude committers pelo campo
  `Committers ativos (90 dias)` se precisar de outro valor de upgrade.
