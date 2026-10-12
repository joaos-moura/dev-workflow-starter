import { readFileSync } from "node:fs";
import { parse, parseAllDocuments } from "yaml";

const arn = "arn:aws:iam::642155085958:role/github-dev-workflow-starter-deploy";

function falha(mensagem) {
  console.error(mensagem);
  process.exit(1);
}

function ler(caminho) {
  return readFileSync(caminho, "utf8");
}

const template = parse(ler("backstage/templates/novo-servico/template.yaml"));

if (template?.apiVersion !== "scaffolder.backstage.io/v1beta3") {
  falha("apiVersion do template deve ser scaffolder.backstage.io/v1beta3.");
}

if (template?.kind !== "Template") {
  falha("kind do template deve ser Template.");
}

const paginas = template.spec?.parameters;
if (!Array.isArray(paginas) || paginas.length === 0) {
  falha("O template precisa de parâmetros.");
}

const propriedades = paginas.flatMap((pagina) => Object.keys(pagina.properties ?? {}));
for (const campo of ["nome", "descricao", "owner"]) {
  if (!propriedades.includes(campo)) {
    falha(`Falta o parâmetro ${campo}.`);
  }
}

const passos = template.spec?.steps;
if (!Array.isArray(passos)) {
  falha("O template precisa de steps.");
}

const acoes = passos.map((passo) => passo.action);
for (const acao of [
  "fetch:plain",
  "fetch:template",
  "publish:github",
  "github:actions:dispatch",
  "catalog:register",
]) {
  if (!acoes.includes(acao)) {
    falha(`Falta a ação ${acao}.`);
  }
}

const publicar = passos.find((passo) => passo.action === "publish:github");
if (publicar?.input?.repoVisibility !== "public") {
  falha("O repositório novo precisa ser público.");
}
if (publicar?.input?.repoVariables?.AWS_ROLE_ARN !== arn) {
  falha("publish:github precisa gravar AWS_ROLE_ARN.");
}
if (publicar?.input?.protectDefaultBranch !== false) {
  falha("protectDefaultBranch precisa ser false.");
}

const repoUrl = String(publicar?.input?.repoUrl ?? "");
if (!repoUrl.includes("owner=joaos-moura") || !repoUrl.includes("parameters.nome")) {
  falha("repoUrl do publish:github precisa do owner joaos-moura e do parâmetro nome.");
}

const disparo = passos.find((passo) => passo.action === "github:actions:dispatch");
if (disparo?.input?.workflowId !== "pipeline.yml") {
  falha("O disparo precisa usar pipeline.yml.");
}
if (disparo?.input?.branchOrTagName !== "main") {
  falha("O disparo precisa da branch main.");
}

const registro = passos.find((passo) => passo.action === "catalog:register");
if (!String(registro?.input?.repoContentsUrl ?? "").includes("repoContentsUrl")) {
  falha("catalog:register precisa do repoContentsUrl publicado.");
}
if (registro?.input?.catalogInfoPath !== "/catalog-info.yaml") {
  falha("catalog:register precisa apontar para /catalog-info.yaml.");
}

const copiar = passos.find((passo) => passo.action === "fetch:plain");
if (!String(copiar?.input?.url ?? "").includes("joaos-moura/dev-workflow-starter")) {
  falha("fetch:plain precisa copiar este starter.");
}

const esqueleto = ler("backstage/templates/novo-servico/skeleton/catalog-info.yaml");
for (const trecho of ["values.nome", "values.descricao", "values.owner", "dump"]) {
  if (!esqueleto.includes(trecho)) {
    falha(`O skeleton precisa de ${trecho}.`);
  }
}

const documentos = parseAllDocuments(ler("catalog-info.yaml"))
  .map((documento) => documento.toJS())
  .filter((documento) => documento && typeof documento === "object");

const grupo = documentos.find((documento) => documento.kind === "Group");
const componente = documentos.find((documento) => documento.kind === "Component");
if (grupo?.metadata?.name !== "time") {
  falha("catalog-info.yaml precisa do Group time.");
}
if (componente?.metadata?.name !== "dev-workflow-starter") {
  falha("catalog-info.yaml precisa do Component dev-workflow-starter.");
}
if (
  componente?.metadata?.annotations?.["github.com/project-slug"] !==
  "joaos-moura/dev-workflow-starter"
) {
  falha("O componente precisa da annotation github.com/project-slug.");
}
if (componente?.spec?.owner !== "group:default/time") {
  falha("O owner do componente deve ser group:default/time.");
}

const textoPipeline = ler(".github/workflows/pipeline.yml");
const pipeline = parse(textoPipeline);
if (!Object.prototype.hasOwnProperty.call(pipeline.on ?? {}, "workflow_dispatch")) {
  falha("pipeline.yml precisa de workflow_dispatch para o template disparar o bootstrap.");
}
if (!textoPipeline.includes("github.event_name == 'workflow_dispatch'")) {
  falha("CD Dev precisa aplicar também no workflow_dispatch.");
}

const exemplo = ler("backstage/app-config.local.yaml.example");
if (/ghp_|github_pat_|gh[ous]_|xox[baprs]-/.test(exemplo)) {
  falha("O exemplo de configuração local não pode conter um token.");
}
if (!exemplo.includes("${GITHUB_TOKEN}")) {
  falha("O exemplo precisa ler o token da variável GITHUB_TOKEN.");
}

console.log("Template do Backstage válido.");
