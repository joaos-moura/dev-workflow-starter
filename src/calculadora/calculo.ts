import {
  BASIC_GRATIS_POR_ORG,
  CAMBIO_PTAX_VENDA,
  JOBS_SELF_HOSTED_GRATIS_POR_ORG,
  MINUTOS_INCLUIDOS_ENTERPRISE,
  MINUTOS_INCLUIDOS_TEAM,
  MINUTOS_POR_JOB_MICROSOFT_PAGO,
  MULTIPLICADOR_MACOS,
  MULTIPLICADOR_WINDOWS,
  PRECOS_OFICIAIS,
  type IdPreco,
  type Precos,
} from "./precos";

export type PlanoGitHub = "team" | "enterprise";
export type RunnerGitHub = "linux-1" | "linux-2" | "linux-arm64" | "windows-2" | "macos";
export type Moeda = "USD" | "BRL";

export type Entradas = {
  pessoas: number;
  minutosMes: number;
  percentualSelfHosted: number;
  planoGitHub: PlanoGitHub;
  runnerGitHub: RunnerGitHub;
  ghas: boolean;
  codeSecurity: boolean;
  secretProtection: boolean;
  committersAtivos: number;
  moeda: Moeda;
  cambio: number;
};

export type Premissas = {
  minutosIncluidosGitHub: boolean;
  multiplicadorDeSo: boolean;
};

/** Uso de hoje no Azure DevOps, em projetos privados, sem campo editável. */
export const CENARIO_ATUAL_AZURE = {
  organizacoes: 1,
  pessoas: 20,
  jobsMicrosoftPagos: 1,
  jobsSelfHostedGratis: JOBS_SELF_HOSTED_GRATIS_POR_ORG,
  jobsSelfHostedPagos: 2,
  ghazdo: false,
} as const;

/**
 * Sem medição de uso ainda: 1.800 min/mês é só um ponto de partida editável, abaixo dos
 * 3.000 incluídos no Team. O número real sai do relatório de consumo do pool no Azure DevOps.
 */
export const MINUTOS_PADRAO = 1800;

export const ENTRADAS_PADRAO: Entradas = {
  pessoas: CENARIO_ATUAL_AZURE.pessoas,
  minutosMes: MINUTOS_PADRAO,
  percentualSelfHosted: 0,
  planoGitHub: "team",
  runnerGitHub: "linux-2",
  ghas: false,
  codeSecurity: true,
  secretProtection: true,
  committersAtivos: CENARIO_ATUAL_AZURE.pessoas,
  moeda: "USD",
  cambio: CAMBIO_PTAX_VENDA,
};

export const PREMISSAS_PADRAO: Premissas = {
  minutosIncluidosGitHub: true,
  multiplicadorDeSo: false,
};

export type Linha = { rotulo: string; detalhe: string; usd: number };

export type Resultado = {
  linhas: readonly Linha[];
  mensalUsd: number;
  anualUsd: number;
  porPessoaUsd: number;
  cadeirasPagas: number;
  cadeirasGratis: number;
  pessoas: number;
  avisos: readonly string[];
};

export type Comparacao = { azure: Resultado; github: Resultado };

function inteiro(valor: number, minimo: number, maximo = Number.POSITIVE_INFINITY) {
  const numero = Number.isFinite(valor) ? Math.floor(valor) : minimo;
  return Math.min(Math.max(numero, minimo), maximo);
}

function decimal(valor: number, minimo: number, maximo = Number.POSITIVE_INFINITY) {
  const numero = Number.isFinite(valor) ? valor : minimo;
  return Math.min(Math.max(numero, minimo), maximo);
}

/** Limita cada entrada ao que faz sentido; committer ativo também ocupa assento. */
export function normalizar(entradas: Entradas): Entradas {
  const pessoas = inteiro(entradas.pessoas, 0);
  return {
    ...entradas,
    pessoas,
    minutosMes: decimal(entradas.minutosMes, 0),
    percentualSelfHosted: decimal(entradas.percentualSelfHosted, 0, 100),
    committersAtivos: inteiro(entradas.committersAtivos, 0, pessoas),
    cambio: decimal(entradas.cambio, 0),
  };
}

export function normalizarPrecos(precos: Precos): Precos {
  return Object.fromEntries(
    Object.entries(precos).map(([id, valor]) => [
      id,
      Number.isFinite(valor) ? Math.max(valor, 0) : 0,
    ]),
  ) as Precos;
}

export function idDoPlano(plano: PlanoGitHub): IdPreco {
  switch (plano) {
    case "team":
      return "ghTeam";
    case "enterprise":
      return "ghEnterprise";
    default: {
      const nunca: never = plano;
      return nunca;
    }
  }
}

export function nomeDoPlano(plano: PlanoGitHub): string {
  switch (plano) {
    case "team":
      return "GitHub Team";
    case "enterprise":
      return "GitHub Enterprise";
    default: {
      const nunca: never = plano;
      return nunca;
    }
  }
}

export function minutosIncluidos(plano: PlanoGitHub): number {
  switch (plano) {
    case "team":
      return MINUTOS_INCLUIDOS_TEAM;
    case "enterprise":
      return MINUTOS_INCLUIDOS_ENTERPRISE;
    default: {
      const nunca: never = plano;
      return nunca;
    }
  }
}

/** Limites de jobs simultâneos em runner padrão hospedado pelo GitHub, por plano. */
export function jobsSimultaneos(plano: PlanoGitHub): { total: number; macos: number } {
  switch (plano) {
    case "team":
      return { total: 60, macos: 5 };
    case "enterprise":
      return { total: 500, macos: 50 };
    default: {
      const nunca: never = plano;
      return nunca;
    }
  }
}

export function idDoRunner(runner: RunnerGitHub): IdPreco {
  switch (runner) {
    case "linux-1":
      return "ghLinux1";
    case "linux-2":
      return "ghLinux2";
    case "linux-arm64":
      return "ghLinuxArm";
    case "windows-2":
      return "ghWindows2";
    case "macos":
      return "ghMacos";
    default: {
      const nunca: never = runner;
      return nunca;
    }
  }
}

export function multiplicador(runner: RunnerGitHub): number {
  switch (runner) {
    case "linux-1":
    case "linux-2":
    case "linux-arm64":
      return 1;
    case "windows-2":
      return MULTIPLICADOR_WINDOWS;
    case "macos":
      return MULTIPLICADOR_MACOS;
    default: {
      const nunca: never = runner;
      return nunca;
    }
  }
}

export type Capacidade = { titulo: string; detalhe: string };

export function capacidadeGitHub(plano: PlanoGitHub, runner: RunnerGitHub): Capacidade {
  const { total, macos } = jobsSimultaneos(plano);
  const detalhe =
    runner === "macos"
      ? `${nomeDoPlano(plano)}, runner padrão; macOS limitado a ${macos} simultâneos.`
      : `${nomeDoPlano(plano)}, runner padrão hospedado pelo GitHub.`;
  return {
    titulo: `${fmt(minutosIncluidos(plano))} minutos inclusos + ${total} jobs simultâneos`,
    detalhe,
  };
}

export function jobsSelfHostedAzure(): number {
  return CENARIO_ATUAL_AZURE.jobsSelfHostedGratis + CENARIO_ATUAL_AZURE.jobsSelfHostedPagos;
}

export function jobsSimultaneosAzure(): number {
  return CENARIO_ATUAL_AZURE.jobsMicrosoftPagos + jobsSelfHostedAzure();
}

export const CAPACIDADE_AZURE_ATUAL: Capacidade = {
  titulo: `${CENARIO_ATUAL_AZURE.jobsMicrosoftPagos} hosted + ${jobsSelfHostedAzure()} self-hosted = até ${jobsSimultaneosAzure()} jobs simultâneos`,
  detalhe: `Só ${CENARIO_ATUAL_AZURE.jobsMicrosoftPagos} em máquina da Microsoft; os outros ${jobsSelfHostedAzure()} rodam nos agentes próprios.`,
};

function fechar(
  linhas: Linha[],
  cadeirasPagas: number,
  cadeirasGratis: number,
  pessoas: number,
  avisos: string[],
): Resultado {
  const mensalUsd = linhas.reduce((soma, linha) => soma + linha.usd, 0);
  return {
    linhas,
    mensalUsd,
    anualUsd: mensalUsd * 12,
    porPessoaUsd: pessoas > 0 ? mensalUsd / pessoas : 0,
    cadeirasPagas,
    cadeirasGratis,
    pessoas,
    avisos,
  };
}

export function calcularAzureAtual(precos: Precos = PRECOS_OFICIAIS): Resultado {
  const { pessoas, organizacoes, jobsMicrosoftPagos, jobsSelfHostedGratis, jobsSelfHostedPagos } =
    CENARIO_ATUAL_AZURE;
  const gratis = Math.min(pessoas, BASIC_GRATIS_POR_ORG * organizacoes);
  const pagas = pessoas - gratis;
  const linhas: Linha[] = [
    {
      rotulo: `Basic · ${pagas} pagos, ${gratis} grátis`,
      detalhe: `${pessoas} assentos − ${gratis} grátis × ${dolar(precos.azBasic)}`,
      usd: pagas * precos.azBasic,
    },
    {
      rotulo: `Job Microsoft-hosted · ${jobsMicrosoftPagos} pago`,
      detalhe: `Sem limite mensal de minutos, até ${MINUTOS_POR_JOB_MICROSOFT_PAGO} min por job × ${dolar(precos.azJobMicrosoft)}`,
      usd: jobsMicrosoftPagos * precos.azJobMicrosoft,
    },
    {
      rotulo: `Jobs self-hosted · ${jobsSelfHostedPagos} pagos, ${jobsSelfHostedGratis} grátis`,
      detalhe: `${jobsSelfHostedAzure()} jobs sem limite de minutos − ${jobsSelfHostedGratis} grátis × ${dolar(precos.azJobSelfHosted)}`,
      usd: jobsSelfHostedPagos * precos.azJobSelfHosted,
    },
    { rotulo: "GHAzDO", detalhe: "Não usado hoje", usd: 0 },
  ];
  return fechar(linhas, pagas, gratis, pessoas, [
    "Fora da conta: o custo das máquinas dos agentes self-hosted (servidor ou nuvem, energia e manutenção).",
  ]);
}

export type UpgradeGhas = { usd: number; produtos: string };

/** Preço do GHAS para os committers informados, mostrado como upgrade opcional quando está desligado. */
export function upgradeGhas(bruto: Entradas, precosBrutos: Precos = PRECOS_OFICIAIS): UpgradeGhas {
  const e = normalizar(bruto);
  const precos = normalizarPrecos(precosBrutos);
  const linhas = linhasGhas(e, precos);
  return {
    usd: linhas.reduce((soma, linha) => soma + linha.usd, 0),
    produtos: linhas.map((linha) => linha.rotulo).join(" + "),
  };
}

function linhasGhas(e: Entradas, precos: Precos): Linha[] {
  const committers = e.committersAtivos;
  const linhas: Linha[] = [];
  if (e.codeSecurity) {
    linhas.push({
      rotulo: "Code Security",
      detalhe: `${committers} committers ativos × ${dolar(precos.ghCodeSecurity)}`,
      usd: committers * precos.ghCodeSecurity,
    });
  }
  if (e.secretProtection) {
    linhas.push({
      rotulo: "Secret Protection",
      detalhe: `${committers} committers ativos × ${dolar(precos.ghSecretProtection)}`,
      usd: committers * precos.ghSecretProtection,
    });
  }
  return linhas;
}

export function calcularGitHub(
  bruto: Entradas,
  premissas: Premissas,
  precosBrutos: Precos = PRECOS_OFICIAIS,
): Resultado {
  const e = normalizar(bruto);
  const precos = normalizarPrecos(precosBrutos);
  const avisos: string[] = [];
  const idPlano = idDoPlano(e.planoGitHub);
  const idRunner = idDoRunner(e.runnerGitHub);

  const linhas: Linha[] = [
    {
      rotulo: nomeDoPlano(e.planoGitHub),
      detalhe: `${e.pessoas} usuários × ${dolar(precos[idPlano])}`,
      usd: e.pessoas * precos[idPlano],
    },
  ];

  const minutos = e.minutosMes * (1 - e.percentualSelfHosted / 100);
  const fator = premissas.multiplicadorDeSo ? multiplicador(e.runnerGitHub) : 1;
  const incluidos = premissas.minutosIncluidosGitHub ? minutosIncluidos(e.planoGitHub) / fator : 0;
  const excedente = Math.max(0, minutos - incluidos);
  linhas.push({
    rotulo: "Actions (minutos hospedados)",
    detalhe: `${fmt(minutos)} min usados, ${fmt(incluidos)} incluídos, ${fmt(excedente)} excedentes × ${dolar(precos[idRunner])}`,
    usd: excedente * precos[idRunner],
  });
  if (e.percentualSelfHosted > 0) {
    avisos.push(
      `${fmt(e.percentualSelfHosted)}% dos minutos em runner self-hosted: sem custo no GitHub.`,
    );
  }

  if (e.ghas) {
    linhas.push(...linhasGhas(e, precos));
  } else {
    avisos.push(
      "Sem GHAS, CodeQL em repositório privado não roda; gates abertos no Actions custam só minutos.",
    );
  }

  return fechar(linhas, e.pessoas, 0, e.pessoas, avisos);
}

export function comparar(
  entradas: Entradas,
  premissas: Premissas,
  precos: Precos = PRECOS_OFICIAIS,
): Comparacao {
  return {
    azure: calcularAzureAtual(),
    github: calcularGitHub(entradas, premissas, precos),
  };
}

export function converter(usd: number, moeda: Moeda, cambio: number): number {
  switch (moeda) {
    case "USD":
      return usd;
    case "BRL":
      return usd * cambio;
    default: {
      const nunca: never = moeda;
      return nunca;
    }
  }
}

export function formatarMoeda(valor: number, moeda: Moeda): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function frasesDeCadeiras(resultado: Resultado): string {
  const cadeiras = fmt(resultado.cadeirasPagas);
  const pessoas = fmt(resultado.pessoas);
  return `${cadeiras} ${resultado.cadeirasPagas === 1 ? "cadeira paga" : "cadeiras pagas"} para ${pessoas} ${resultado.pessoas === 1 ? "pessoa" : "pessoas"}`;
}

function fmt(valor: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(valor);
}

function dolar(valor: number) {
  return `US$ ${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(valor)}`;
}
