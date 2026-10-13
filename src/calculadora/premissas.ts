import type { Premissas } from "./calculo";
import { FONTES } from "./precos";

export type FichaPremissa = {
  chave: keyof Premissas;
  rotulo: string;
  texto: string;
  fonte: string;
  estimativa?: boolean;
};

export const FICHAS_PREMISSAS: readonly FichaPremissa[] = [
  {
    chave: "minutosIncluidosGitHub",
    rotulo: "Minutos incluídos no plano",
    texto: "Team 3.000 e Enterprise Cloud 50.000 min/mês, só em runner padrão.",
    fonte: FONTES.githubActions,
  },
  {
    chave: "multiplicadorDeSo",
    rotulo: "Multiplicador antigo de SO",
    texto:
      "Windows 2× e macOS 10× sobre os minutos incluídos. A documentação atual não cita multiplicador.",
    fonte: FONTES.githubRunners,
    estimativa: true,
  },
];

export type Citacao = { texto: string; fonte: string };

export const CITACOES = {
  basicGratis: {
    texto: "Basic access is free for the first 5 users and paid for 6 or more users.",
    fonte: FONTES.azureAcesso,
  },
  precoJobs: {
    texto:
      "$40 per extra Microsoft-hosted CI/CD parallel job and $15 per extra self-hosted CI/CD parallel job with unlimited minutes",
    fonte: FONTES.azurePrecos,
  },
  jobMicrosoftPago: {
    texto:
      "When you purchase your first Microsoft-hosted parallel job, the number of parallel jobs you have in the organization is still one. To run two jobs concurrently, you need to purchase two parallel jobs if you're currently on the free tier. The first purchase only removes the time limits on the first job.",
    fonte: FONTES.azureJobs,
  },
  limitePago: {
    texto: "Paid tier | 360 minutes per job | No monthly limit",
    fonte: FONTES.azureJobs,
  },
  jobSelfHostedGratis: {
    texto:
      "For private projects, the free tier includes one parallel job plus one parallel job for each active Visual Studio Enterprise subscriber who is a member of your organization.",
    fonte: FONTES.azureJobs,
  },
  selfHostedPorJob: {
    texto:
      "We charge based on the number of jobs you want to run at a time, not the number of agents registered. There are no time limits on self-hosted jobs.",
    fonte: FONTES.azureJobs,
  },
  concorrencia: {
    texto:
      "If you have one parallel job, you can run one pipeline job at a time. If you have five parallel jobs, you can run five pipeline jobs at a time.",
    fonte: FONTES.azureJobs,
  },
  doisTipos: {
    texto:
      "Azure DevOps Services has two types of parallel jobs: Microsoft-hosted and self-hosted.",
    fonte: FONTES.azureJobs,
  },
  porOrg: {
    texto: "With default assignment-based billing, each organization gets five free Basic users.",
    fonte: FONTES.azureFaq,
  },
  multiOrg: {
    texto:
      "If you're a member of more than one Azure DevOps organization, you can turn on multi-organization billing and pay for each Basic or Basic + Test Plans human user once, for all organizations under the same billing Azure subscription.",
    fonte: FONTES.azureAcesso,
  },
  jobsGitHub: {
    texto:
      "Job concurrency limits for GitHub-hosted runners: Standard GitHub-hosted runner | Team | 60 | 5 · Standard GitHub-hosted runner | Enterprise | 500 | 50 (total concurrent jobs | maximum concurrent macOS jobs).",
    fonte: FONTES.githubLimites,
  },
  minutosGitHub: {
    texto:
      "Storage limits for all GitHub-hosted runners, Minutes (per month): GitHub Team | 3,000 · GitHub Enterprise Cloud | 50,000.",
    fonte: FONTES.githubLimites,
  },
} as const satisfies Record<string, Citacao>;
