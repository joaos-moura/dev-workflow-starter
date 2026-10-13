export const VERIFICADO_EM = "13/10/2026";

export const FONTES = {
  azurePrecos: "https://azure.microsoft.com/en-us/pricing/details/devops/azure-devops-services/",
  azureAcesso:
    "https://learn.microsoft.com/en-us/azure/devops/organizations/billing/buy-basic-access-add-users?view=azure-devops",
  azureFaq:
    "https://learn.microsoft.com/en-us/azure/devops/organizations/billing/billing-faq?view=azure-devops",
  azureJobs:
    "https://learn.microsoft.com/en-us/azure/devops/pipelines/licensing/concurrent-jobs?view=azure-devops",
  azureGhas:
    "https://learn.microsoft.com/en-us/azure/devops/repos/security/github-advanced-security-billing?view=azure-devops",
  githubPrecos: "https://github.com/pricing",
  githubSeguranca: "https://github.com/security/plans",
  githubRunners: "https://docs.github.com/en/billing/reference/actions-runner-pricing",
  githubActions: "https://docs.github.com/en/billing/concepts/product-billing/github-actions",
  githubLimites: "https://docs.github.com/en/actions/reference/limits",
  githubGhas:
    "https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security",
  githubCodeScanning:
    "https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning",
  ptax: "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/aplicacao#!/recursos/CotacaoDolarDia",
} as const;

export type IdPreco =
  | "azBasic"
  | "azJobMicrosoft"
  | "azJobSelfHosted"
  | "azCodeSecurity"
  | "azSecretProtection"
  | "ghTeam"
  | "ghEnterprise"
  | "ghLinux1"
  | "ghLinux2"
  | "ghLinuxArm"
  | "ghWindows2"
  | "ghMacos"
  | "ghCodeSecurity"
  | "ghSecretProtection";

export type Precos = Record<IdPreco, number>;

export type FichaPreco = {
  id: IdPreco;
  plataforma: "Azure DevOps" | "GitHub";
  item: string;
  valor: number;
  unidade: string;
  fonte: string;
};

export const FICHAS: readonly FichaPreco[] = [
  {
    id: "azBasic",
    plataforma: "Azure DevOps",
    item: "Basic (do 6º usuário em diante)",
    valor: 6,
    unidade: "usuário/mês, por org",
    fonte: FONTES.azurePrecos,
  },
  {
    id: "azJobMicrosoft",
    plataforma: "Azure DevOps",
    item: "Job paralelo Microsoft-hosted",
    valor: 40,
    unidade: "job/mês, minutos ilimitados",
    fonte: FONTES.azurePrecos,
  },
  {
    id: "azJobSelfHosted",
    plataforma: "Azure DevOps",
    item: "Job paralelo self-hosted extra",
    valor: 15,
    unidade: "job/mês, minutos ilimitados",
    fonte: FONTES.azurePrecos,
  },
  {
    id: "azCodeSecurity",
    plataforma: "Azure DevOps",
    item: "GHAzDO Code Security",
    valor: 30,
    unidade: "committer ativo/mês",
    fonte: FONTES.azurePrecos,
  },
  {
    id: "azSecretProtection",
    plataforma: "Azure DevOps",
    item: "GHAzDO Secret Protection",
    valor: 19,
    unidade: "committer ativo/mês",
    fonte: FONTES.azurePrecos,
  },
  {
    id: "ghTeam",
    plataforma: "GitHub",
    item: "GitHub Team",
    valor: 4,
    unidade: "usuário/mês",
    fonte: FONTES.githubPrecos,
  },
  {
    id: "ghEnterprise",
    plataforma: "GitHub",
    item: "GitHub Enterprise (a partir de)",
    valor: 21,
    unidade: "usuário/mês",
    fonte: FONTES.githubPrecos,
  },
  {
    id: "ghLinux1",
    plataforma: "GitHub",
    item: "Actions · Linux 1-core",
    valor: 0.002,
    unidade: "minuto",
    fonte: FONTES.githubRunners,
  },
  {
    id: "ghLinux2",
    plataforma: "GitHub",
    item: "Actions · Linux 2-core",
    valor: 0.006,
    unidade: "minuto",
    fonte: FONTES.githubRunners,
  },
  {
    id: "ghLinuxArm",
    plataforma: "GitHub",
    item: "Actions · Linux arm64 2-core",
    valor: 0.005,
    unidade: "minuto",
    fonte: FONTES.githubRunners,
  },
  {
    id: "ghWindows2",
    plataforma: "GitHub",
    item: "Actions · Windows 2-core",
    valor: 0.01,
    unidade: "minuto",
    fonte: FONTES.githubRunners,
  },
  {
    id: "ghMacos",
    plataforma: "GitHub",
    item: "Actions · macOS",
    valor: 0.062,
    unidade: "minuto",
    fonte: FONTES.githubRunners,
  },
  {
    id: "ghCodeSecurity",
    plataforma: "GitHub",
    item: "GitHub Code Security",
    valor: 30,
    unidade: "committer ativo/mês",
    fonte: FONTES.githubSeguranca,
  },
  {
    id: "ghSecretProtection",
    plataforma: "GitHub",
    item: "GitHub Secret Protection",
    valor: 19,
    unidade: "committer ativo/mês",
    fonte: FONTES.githubSeguranca,
  },
];

export const PRECOS_OFICIAIS: Precos = Object.fromEntries(
  FICHAS.map((ficha) => [ficha.id, ficha.valor]),
) as Precos;

/** Cotações e cotas oficiais que não são preço, mas entram na conta. */
export const CAMBIO_PTAX_VENDA = 5.0096;
export const BASIC_GRATIS_POR_ORG = 5;
export const MINUTOS_POR_JOB_MICROSOFT_PAGO = 360;
export const JOBS_SELF_HOSTED_GRATIS_POR_ORG = 1;
export const MINUTOS_INCLUIDOS_TEAM = 3000;
export const MINUTOS_INCLUIDOS_ENTERPRISE = 50000;

/**
 * Regra antiga de consumo dos minutos incluídos (Windows 2×, macOS 10×). A documentação
 * atual não cita multiplicador; por isso fica desligada por padrão e marcada como estimativa.
 */
export const MULTIPLICADOR_WINDOWS = 2;
export const MULTIPLICADOR_MACOS = 10;

/** O lado Azure DevOps é o cenário atual, fixo a preço oficial; só o GitHub aceita edição. */
export function precoEditavel(ficha: FichaPreco): boolean {
  return ficha.plataforma === "GitHub";
}

export function origemDoPreco(id: IdPreco, valor: number): "oficial" | "estimativa" {
  return valor === PRECOS_OFICIAIS[id] ? "oficial" : "estimativa";
}
