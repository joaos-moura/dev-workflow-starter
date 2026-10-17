#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";

const CAMINHO = ".github/workflows/pipeline.yml";

const DEPLOYS = {
  preview: /^preview-/,
  cd_dev: /^deploy-dev-/,
  cd_hml: /^deploy-hml-/,
  perf_hml: /^deploy-hml-/,
  cd_prd: /^deploy-prd-/,
};

const NA_MAIN = "github.event_name == 'push' && github.ref == 'refs/heads/main'";

function falha(mensagem) {
  throw new Error(mensagem);
}

function grupoDe(job) {
  const valor = job?.concurrency;
  if (valor == null) return null;
  if (typeof valor === "string") return { group: valor, cancelInProgress: undefined };
  if (typeof valor === "object") {
    return {
      group: String(valor.group ?? ""),
      cancelInProgress: valor["cancel-in-progress"],
    };
  }
  return { group: String(valor), cancelInProgress: undefined };
}

/** Invariantes do #15: sem concurrency no workflow; deploys em grupo próprio, sem cancelar. */
export function validarPipeline(texto) {
  const doc = parse(texto);
  if (!doc || typeof doc !== "object") falha("pipeline.yml inválido.");

  if (doc.concurrency != null) {
    const grupo =
      typeof doc.concurrency === "string" ? doc.concurrency : (doc.concurrency.group ?? "?");
    falha(
      `concurrency no nível do workflow (group=${grupo}). Isso cancela CI e deploy juntos. Use grupo por job.`,
    );
  }

  const jobs = doc.jobs;
  if (!jobs || typeof jobs !== "object") falha("pipeline.yml sem jobs.");

  for (const [id, padrao] of Object.entries(DEPLOYS)) {
    const job = jobs[id];
    if (!job) falha(`Falta o job ${id}.`);
    const conc = grupoDe(job);
    if (!conc) falha(`O job ${id} precisa de concurrency próprio.`);
    if (!padrao.test(conc.group)) {
      falha(`O job ${id} tem group="${conc.group}", esperado ${padrao}.`);
    }
    if (conc.group.includes("pipeline-${{ github.ref }}") && !conc.group.includes("pipeline-ci-")) {
      falha(`O job ${id} reusa o group do workflow antigo (pipeline-\${{ github.ref }}).`);
    }
    if (conc.cancelInProgress !== false) {
      falha(
        `O job ${id} precisa de cancel-in-progress: false. Um CD esperando aprovação não pode cancelar o próximo.`,
      );
    }
  }

  for (const id of ["cd_hml", "perf_hml", "cd_prd"]) {
    const condicao = String(jobs[id]?.if ?? "");
    if (
      !condicao.includes("github.event_name == 'push'") ||
      !condicao.includes("refs/heads/main")
    ) {
      falha(
        `O job ${id} precisa rodar só no push da main (${NA_MAIN}). Num PR deve aparecer skipped.`,
      );
    }
  }
}

function principal() {
  validarPipeline(readFileSync(CAMINHO, "utf8"));
  console.log("pipeline.yml: concurrency por job de deploy, sem cancelar; HML/PRD só na main.");
}

const ehCli =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (ehCli) {
  try {
    principal();
  } catch (erro) {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exit(1);
  }
}
