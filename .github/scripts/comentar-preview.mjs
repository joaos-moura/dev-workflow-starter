import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const marcador = "<!-- dws-preview -->";
const token = process.env.GITHUB_TOKEN;
const repositorio = process.env.GITHUB_REPOSITORY;
const numero = process.env.PR_NUMBER;
const modo = process.env.MODO;

if (!token || !repositorio || !numero || !modo) {
  console.error(
    "Faltam GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER ou MODO para comentar o preview.",
  );
  process.exit(1);
}

const [dono, nome] = repositorio.split("/");
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function github(caminho, opcoes = {}) {
  const resposta = await fetch(`https://api.github.com${caminho}`, {
    method: opcoes.method ?? "GET",
    body: opcoes.body,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "dev-workflow-starter",
      ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!resposta.ok) {
    const texto = await resposta.text();
    throw new Error(`A API do GitHub respondeu ${resposta.status}: ${texto}`);
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function cerca(texto) {
  return texto.includes("```") ? "~~~~" : "```";
}

async function corpo() {
  if (modo === "destroy") {
    return [
      marcador,
      "## Preview",
      "",
      "O pull request fechou. O workspace isolado deste preview foi destruído, se existia. A URL antiga deixa de responder.",
      "",
    ].join("\n");
  }

  if (modo !== "plan" && modo !== "url") {
    throw new Error(`Modo de comentário desconhecido: ${modo}.`);
  }

  const planoBruto = await readFile(path.join(raiz, "infra", "plan.txt"), "utf8").catch(() => "");
  const plano = planoBruto.replaceAll("\r\n", "\n").slice(0, 45000);
  const limite = cerca(plano);
  const linhas = [marcador, "## Preview", ""];

  if (modo === "url") {
    linhas.push(`- Site: ${process.env.SITE_URL ?? ""}`);
    linhas.push(`- API: ${process.env.API_URL ?? ""}`);
    linhas.push("");
  } else {
    linhas.push("O plan foi gerado. O apply do preview segue neste job.");
    linhas.push("");
  }

  linhas.push("<details><summary>Terraform plan</summary>", "");
  linhas.push(`${limite}hcl`);
  linhas.push(plano.trimEnd());
  linhas.push(limite, "</details>", "");
  return linhas.join("\n");
}

try {
  const texto = await corpo();
  const comentarios = await github(`/repos/${dono}/${nome}/issues/${numero}/comments?per_page=100`);
  const existente = comentarios.find((comentario) => comentario.body?.includes(marcador));

  if (existente) {
    await github(`/repos/${dono}/${nome}/issues/comments/${existente.id}`, {
      method: "PATCH",
      body: JSON.stringify({ body: texto }),
    });
  } else {
    await github(`/repos/${dono}/${nome}/issues/${numero}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: texto }),
    });
  }
} catch (erro) {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  console.error(`Não foi possível comentar o preview no pull request. ${mensagem}`);
  process.exit(1);
}
