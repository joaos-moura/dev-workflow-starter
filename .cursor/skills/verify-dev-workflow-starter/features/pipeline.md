# Pipeline visual e checagens de PR

Seção 8, `#pipeline`. Mostra a esteira antiga (trava em HML) e a nova (preview
no PR, CD Dev no merge). O YAML em `.github/workflows/pipeline.yml` é a fonte.

## Sub-features

- Faixas Antes / Depois (`.lane.b` / `.lane.a`) com tokens animados.
- Listas **Esteira antes** e **Esteira depois** (Preview PR e CD Dev são
  `novo`).
- Jobs reais: Detecção → Gates → Testes → Build → Preview PR → CD Dev → CD HML
  → Perf HML → CD PRD.
- Concurrency por job de deploy, `cancel-in-progress: false`. Sem concurrency no
  workflow.

## How to get to it (user POV)

1. Abrir `#pipeline` no site.
2. No GitHub, abrir o PR e olhar a aba Checks — sem aprovar HML/PRD.

## Driving it with Playwright

```js
await page.goto("./#pipeline");
const secao = page.getByRole("region", { name: "Pipeline" });
await expect(secao.getByText("Preview PR")).toBeVisible();
await expect(secao.getByText("CD Dev")).toBeVisible();
```

No YAML, não há Playwright: rode o validador.

```bash
npm run validar:workflows
# ou: node .github/scripts/validar-workflows.mjs .
```

Checagens de um PR (só leitura):

```bash
.cursor/skills/verify-dev-workflow-starter/scripts/checagens-pr.sh <n>
```

Num PR **precisam passar**: CI, CodeQL, eslint, reviewdog, Detecção, Gates,
Testes e cobertura, Build e scan, Preview PR, CD Dev.

**Skipped**: CD HML, Perf HML, CD PRD. O `if` deles é `push` + `refs/heads/main`.
O R1 de `validar:workflows` quebra se o `concurrency` voltar ao topo do
`pipeline.yml` enquanto esses jobs tiverem `environment: hml` ou `prd`.

## Gotchas

- O #15 era `concurrency: { group: pipeline-${{ github.ref }} }` no workflow:
  um CD HML esperando aprovação cancelava o CI do push seguinte. Não recoloque.
- CD Dev no PR **passa** (passo inerte). Não é skipped. HML/PRD é que são
  skipped.
- Nunca `gh workflow run` com environment, nunca aprove o job. `gh` aqui é
  leitura (`pr view`, `pr checks`).
- `pages.yml` tem concurrency próprio (`group: pages`); o validador olha só
  `pipeline.yml`.
