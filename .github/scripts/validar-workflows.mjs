#!/usr/bin/env node
/**
 * Lint para .github/: regras que nasceram de erros reais (#2 e #15).
 * Uso: node validar-workflows.mjs [raiz-do-repo]
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";

const AMBIENTES_COM_APROVACAO = new Set(["hml", "prd"]);

const nomeDoAmbiente = (env) => (typeof env === "string" ? env : env?.name);

function yml(dir) {
  return existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => /\.ya?ml$/.test(f))
        .map((f) => join(dir, f))
    : [];
}

export function verificarWorkflows(raiz) {
  const erros = [];

  // R1 (#9 → #15): concurrency no nível do workflow + job com `environment`
  // (aprovação) faz o run parado em HML segurar o grupo e o GitHub cancelar o
  // run seguinte da main.
  for (const arquivo of yml(join(raiz, ".github/workflows"))) {
    const wf = parse(readFileSync(arquivo, "utf8")) ?? {};
    const comAprovacao = Object.entries(wf.jobs ?? {}).filter(([, job]) =>
      AMBIENTES_COM_APROVACAO.has(nomeDoAmbiente(job?.environment)),
    );
    if (wf.concurrency && comAprovacao.length > 0) {
      erros.push(
        `${arquivo}: 'concurrency' no topo do workflow com job(s) que esperam aprovação ` +
          `(${comAprovacao.map(([id]) => id).join(", ")}). Um run parado na aprovação cancela o próximo push. ` +
          `Correção: tire o concurrency do topo e declare por job — deploy-<ambiente>-\${{ github.ref }} ` +
          `(queue: max no dev, cancel-in-progress: false em HML/PRD), como no pipeline.yml desde o #15.`,
      );
    }
  }

  // R2 (#2): composite action não enxerga `vars` nem `secrets`; o erro só aparece no runner.
  const acoes = join(raiz, ".github/actions");
  for (const dir of existsSync(acoes) ? readdirSync(acoes) : []) {
    for (const arquivo of yml(join(acoes, dir))) {
      const texto = readFileSync(arquivo, "utf8");
      if (parse(texto)?.runs?.using !== "composite") continue;
      texto.split("\n").forEach((linha, i) => {
        const m = linha.match(/\$\{\{\s*(vars|secrets)\./);
        if (m) {
          erros.push(
            `${arquivo}:${i + 1}: composite action lê '${m[1]}.' — o runner rejeita ('Unrecognized named-value'). ` +
              `Correção: declare um input e passe \${{ ${m[1]}.X }} no 'with:' do workflow (ver porta-aws desde o #2).`,
          );
        }
      });
    }
  }

  return erros;
}

export function validarRaiz(raiz) {
  const erros = verificarWorkflows(raiz);
  if (erros.length) {
    console.error(erros.map((e) => `✗ ${e}`).join("\n"));
    process.exitCode = 1;
    return erros;
  }
  console.log("✓ workflows ok");
  return [];
}

const ehCli =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (ehCli) {
  validarRaiz(process.argv[2] ?? ".");
}
