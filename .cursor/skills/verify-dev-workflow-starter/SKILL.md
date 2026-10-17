---
name: verify-dev-workflow-starter
description: >-
  Verify changes to the public SPA of dev-workflow-starter (Vite + React
  sections, Custos calculator, anchors, reduced motion, GitHub Actions
  pipeline) before opening a PR. Use when proving a UI, CSS, calculator, or
  workflow change works end to end.
---

# Verificar o SPA do dev-workflow-starter

Pirâmide invertida. Cada degrau de baixo é um comando; texto só entra quando o
comando não dá conta.

1. **Código, tipos e invariantes** — o caminho fácil é o certo
   (`validar:movimento`, `validar:workflows`).
2. **Análise estática** — `verificar.sh` (lint, testes, CI local).
3. **Prosa mínima** — `features/` diz o que clicar, não o que deveria ser verdade.
4. **Revisão humana por último.**

Não cite empresa, repositório interno nem nome de pessoa. Não aprove environment
HML/PRD. Não faça merge.

## Launch

O site é um SPA Vite com `base: /dev-workflow-starter/`. O preview serve o
`dist/` nessa base, na porta **4173** — a mesma do Playwright.

```bash
.cursor/skills/verify-dev-workflow-starter/scripts/launch.sh
```

O script faz `npm run build` e sobe `npx vite preview --host 127.0.0.1 --port 4173 --strictPort`.
**Pronto** quando `curl -sf http://127.0.0.1:4173/dev-workflow-starter/` contém
`dev-workflow-starter`. Pid e URL ficam em `.cursor/skills/verify-dev-workflow-starter/.run/`.
Se a porta já responde, reusa o processo e marca `reused` para o cleanup não matá-lo.

Equivalente manual:

```bash
npm run build
npx vite preview --port 4173 --strictPort
```

## Doctor

Uma leitura. Não clica, não altera estado.

```bash
node .cursor/skills/verify-dev-workflow-starter/scripts/doctor.mjs
```

Confere HTTP 200, o título no HTML, a `nav` `Seções`, o `h1` com `opacity: 1`,
doze `section` e os ids `#desafio`, `#pipeline`, `#custos`, `#usar`. Se o h1
nasce invisível, o #12 voltou — pare e rode os testes de estilo.

## Drive

Playwright contra o preview. Seletores de verdade (ARIA / `data-testid`), sem
setter de teste.

```bash
node .cursor/skills/verify-dev-workflow-starter/scripts/drive.mjs custos
node .cursor/skills/verify-dev-workflow-starter/scripts/drive.mjs ancoras
node .cursor/skills/verify-dev-workflow-starter/scripts/drive.mjs movimento
node .cursor/skills/verify-dev-workflow-starter/scripts/drive.mjs pipeline
node .cursor/skills/verify-dev-workflow-starter/scripts/drive.mjs usar
```

Detalhe por superfície: `features/`. Âncoras e movimento reduzido também rodam no
e2e do CI:

```bash
.cursor/skills/verify-dev-workflow-starter/scripts/e2e.sh
# = npm run test:e2e
```

## Evidence

O caminho do usuário, nas viewports do Playwright (1440 e 390). Sem injetar estado.

```bash
node .cursor/skills/verify-dev-workflow-starter/scripts/evidence.mjs
```

Arquivos em `.cursor/skills/verify-dev-workflow-starter/evidence/`:

- `custos-1440.png` / `custos-390.png` — seção `#custos`
- `ancora-custos-1440.png` — carga direta em `#custos` com `prefers-reduced-motion`
- `pipeline-reduce-1440.png` — `#pipeline` com reduce (token ainda anima)

A pasta **não é apagada pelo cleanup**. Cópia para
`/opt/cursor/artifacts/screenshots/` quando esse diretório existe.

## Cleanup

Mata só o pid que o `launch.sh` gravou. Se o preview já estava no ar, não mexe.

```bash
.cursor/skills/verify-dev-workflow-starter/scripts/cleanup.sh
```

Não apaga `evidence/`.

## Helpers

Todos a partir da raiz do repo:

| Comando                            | O que faz                                               |
| ---------------------------------- | ------------------------------------------------------- |
| `scripts/verificar.sh`             | lint + `npm test` + `validar:invariantes` + build + e2e |
| `scripts/launch.sh`                | build + preview 4173                                    |
| `node scripts/doctor.mjs`          | leitura do preview                                      |
| `node scripts/drive.mjs <recurso>` | Playwright numa superfície                              |
| `node scripts/evidence.mjs`        | capturas 1440/390                                       |
| `scripts/e2e.sh`                   | `npm run test:e2e` (âncoras + movimento)                |
| `scripts/cleanup.sh`               | mata o preview deste launch                             |
| `scripts/checagens-pr.sh <n>`      | `gh pr checks` só leitura                               |

`scripts/` acima = `.cursor/skills/verify-dev-workflow-starter/scripts/`.

### Camada 2 — comandos do package.json

```bash
npm run lint          # eslint . && prettier --check .
npm test              # vitest run (jsdom, css: true)
npm run validar:movimento   # postcss em src/styles.css (M1, M2)
npm run validar:workflows   # YAML de .github/ (R1, R2)
npm run validar:invariantes # os dois + node --test
npm run build               # tsc --noEmit && vite build
npm run test:e2e            # Playwright 1440 e 390, preview na 4173
                            # no CI: job "E2E (Playwright)" em todo PR
```

Invariantes que já não são texto:

- `.github/scripts/validar-movimento.mjs` — M1: nenhum `*` com `animation`/`transition: none`
  (ou `!important`) dentro de `prefers-reduced-motion`. M2: `.rv` não começa com
  `opacity: 0` sem a guarda `.mov` (bug #12).
- `.github/scripts/validar-workflows.mjs` — R1: sem `concurrency` no topo do
  workflow quando há job com `environment: hml|prd`. R2: composite action não
  lê `vars.`/`secrets.` (bugs #15 e #2).
- `e2e/ancora.e2e.ts` — carga com hash, seção sob a barra, h2 visível, reduce sem
  rolagem animada.
- `e2e/movimento.e2e.ts` — com reduce, `#pipeline h2` visível e
  `.lane.a .tok` com `animationName !== none`; sem `.mov`, o `.rv` permanece
  visível. Roda no job **E2E (Playwright)** de `.github/workflows/ci.yml` em
  todo PR (não só pelo helper).

## Checagens de PR (sem aprovar HML/PRD)

```bash
.cursor/skills/verify-dev-workflow-starter/scripts/checagens-pr.sh 13
# ou: gh pr checks 13
#      gh pr view 13 --json isDraft,state,statusCheckRollup
```

Num pull request estes jobs **precisam passar**: CI, **E2E (Playwright)**, CodeQL, eslint, reviewdog,
Detecção de tecnologia, Gates de segurança, Testes e cobertura, Build e scan,
Preview PR, CD Dev (inerte no PR, termina verde).

Estes **precisam aparecer skipped**: CD HML, Perf HML, CD PRD — o `if` deles é
`github.event_name == 'push' && github.ref == 'refs/heads/main'`. O R1 do
`validar:workflows` quebra se o concurrency voltar para o topo do
`pipeline.yml`. Nunca aprove o environment.

## Ordem de um ciclo

```bash
.cursor/skills/verify-dev-workflow-starter/scripts/verificar.sh
.cursor/skills/verify-dev-workflow-starter/scripts/launch.sh
node .cursor/skills/verify-dev-workflow-starter/scripts/doctor.mjs
node .cursor/skills/verify-dev-workflow-starter/scripts/drive.mjs custos
node .cursor/skills/verify-dev-workflow-starter/scripts/evidence.mjs
.cursor/skills/verify-dev-workflow-starter/scripts/cleanup.sh
```
