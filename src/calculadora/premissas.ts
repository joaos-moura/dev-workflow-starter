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
    chave: "cincoBasicGratis",
    rotulo: "Primeiros 5 Basic grátis",
    texto: "5 por org na cobrança padrão; 5 por assinatura com multi-org billing.",
    fonte: FONTES.azureFaq,
  },
  {
    chave: "multiOrg",
    rotulo: "Multi-org billing ativo",
    texto:
      "Cobra cada usuário humano Basic ou Basic + Test Plans uma vez entre orgs da mesma assinatura. Não vale para service principal.",
    fonte: FONTES.azureAcesso,
  },
  {
    chave: "mesmaAssinatura",
    rotulo: "Orgs na mesma assinatura Azure",
    texto: "Exigido pelo multi-org billing e pela deduplicação de committers do GHAzDO.",
    fonte: FONTES.azureFaq,
  },
  {
    chave: "testPlansEmUmaOrg",
    rotulo: "Tester cruzado: Test Plans numa org, Basic nas outras",
    texto: "Com multi-org billing, quem tem os dois níveis em orgs diferentes paga os dois.",
    fonte: FONTES.azureFaq,
  },
  {
    chave: "stakeholderGratis",
    rotulo: "Stakeholder grátis no Azure DevOps",
    texto: "Acesso Stakeholder é gratuito, com funções limitadas.",
    fonte: FONTES.azureAcesso,
  },
  {
    chave: "cotaGratisMicrosoftHosted",
    rotulo: "Cota grátis Microsoft-hosted",
    texto:
      "1 job por org, até 60 min por execução e 1.800 min/mês. Precisa ser ativada ligando a cobrança.",
    fonte: FONTES.azureJobs,
  },
  {
    chave: "minutosIncluidosGitHub",
    rotulo: "Minutos incluídos no plano GitHub",
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
  {
    chave: "stakeholdersNoGitHub",
    rotulo: "Stakeholders ocupam assento no GitHub",
    texto: "O GitHub cobra por usuário; quem acessa repositório privado ocupa um assento.",
    fonte: FONTES.githubPrecos,
  },
];
