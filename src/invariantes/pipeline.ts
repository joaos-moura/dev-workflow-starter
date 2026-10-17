import { parse } from "yaml";

const DEPLOYS: Record<string, RegExp> = {
  preview: /^preview-/,
  cd_dev: /^deploy-dev-/,
  cd_hml: /^deploy-hml-/,
  perf_hml: /^deploy-hml-/,
  cd_prd: /^deploy-prd-/,
};

const NA_MAIN = "github.event_name == 'push' && github.ref == 'refs/heads/main'";

type Job = {
  if?: string;
  concurrency?: string | { group?: string; "cancel-in-progress"?: boolean };
};

function falha(mensagem: string): never {
  throw new Error(mensagem);
}

function grupoDe(job: Job) {
  const valor = job.concurrency;
  if (valor == null) return null;
  if (typeof valor === "string") return { group: valor, cancelInProgress: undefined };
  return {
    group: String(valor.group ?? ""),
    cancelInProgress: valor["cancel-in-progress"],
  };
}

/** Mesmas regras de `.github/scripts/validar-concorrencia-pipeline.mjs`. */
export function validarPipeline(texto: string) {
  const doc = parse(texto) as { concurrency?: unknown; jobs?: Record<string, Job> } | null;
  if (!doc || typeof doc !== "object") falha("pipeline.yml inválido.");

  if (doc.concurrency != null) {
    const bruto = doc.concurrency;
    const grupo =
      typeof bruto === "string"
        ? bruto
        : typeof bruto === "object" && bruto && "group" in bruto
          ? String((bruto as { group?: string }).group ?? "?")
          : "?";
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
