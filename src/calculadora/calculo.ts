import {
  BASIC_GRATIS_POR_ORG,
  CAMBIO_PTAX_VENDA,
  JOBS_SELF_HOSTED_GRATIS_POR_ORG,
  MINUTOS_GRATIS_MICROSOFT_POR_ORG,
  MINUTOS_INCLUIDOS_ENTERPRISE,
  MINUTOS_INCLUIDOS_TEAM,
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
  organizacoes: number;
  pessoasCruzadas: number;
  mediaOrgsCruzadas: number;
  usuariosTestPlans: number;
  testersCruzados: number;
  stakeholders: number;
  minutosMes: number;
  percentualSelfHosted: number;
  jobsMicrosoftPorOrg: number;
  jobsSelfHostedPorOrg: number;
  ghas: boolean;
  codeSecurity: boolean;
  secretProtection: boolean;
  committersAtivos: number;
  planoGitHub: PlanoGitHub;
  runnerGitHub: RunnerGitHub;
  moeda: Moeda;
  cambio: number;
};

export type Premissas = {
  cincoBasicGratis: boolean;
  multiOrg: boolean;
  mesmaAssinatura: boolean;
  stakeholderGratis: boolean;
  cotaGratisMicrosoftHosted: boolean;
  testPlansEmUmaOrg: boolean;
  minutosIncluidosGitHub: boolean;
  multiplicadorDeSo: boolean;
  stakeholdersNoGitHub: boolean;
};

export const ENTRADAS_PADRAO: Entradas = {
  pessoas: 20,
  organizacoes: 1,
  pessoasCruzadas: 0,
  mediaOrgsCruzadas: 2,
  usuariosTestPlans: 0,
  testersCruzados: 0,
  stakeholders: 0,
  minutosMes: 6000,
  percentualSelfHosted: 0,
  jobsMicrosoftPorOrg: 1,
  jobsSelfHostedPorOrg: 0,
  ghas: false,
  codeSecurity: true,
  secretProtection: true,
  committersAtivos: 20,
  planoGitHub: "team",
  runnerGitHub: "linux-2",
  moeda: "USD",
  cambio: CAMBIO_PTAX_VENDA,
};

export const PREMISSAS_PADRAO: Premissas = {
  cincoBasicGratis: true,
  multiOrg: false,
  mesmaAssinatura: true,
  stakeholderGratis: true,
  cotaGratisMicrosoftHosted: true,
  testPlansEmUmaOrg: true,
  minutosIncluidosGitHub: true,
  multiplicadorDeSo: false,
  stakeholdersNoGitHub: true,
};

export type Linha = { rotulo: string; detalhe: string; usd: number };

export type Resultado = {
  linhas: readonly Linha[];
  mensalUsd: number;
  anualUsd: number;
  porPessoaUsd: number;
  cadeirasPagas: number;
  pessoas: number;
  cadeirasDuplicadas: number;
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

/** Limita cada entrada ao que faz sentido junto com as outras. */
export function normalizar(entradas: Entradas): Entradas {
  const pessoas = inteiro(entradas.pessoas, 0);
  const organizacoes = inteiro(entradas.organizacoes, 1);
  const pessoasCruzadas = organizacoes > 1 ? inteiro(entradas.pessoasCruzadas, 0, pessoas) : 0;
  const mediaOrgsCruzadas =
    pessoasCruzadas > 0 ? decimal(entradas.mediaOrgsCruzadas, 1, organizacoes) : 1;
  const usuariosTestPlans = inteiro(entradas.usuariosTestPlans, 0, pessoas);
  const testersCruzados = inteiro(
    entradas.testersCruzados,
    0,
    Math.min(usuariosTestPlans, pessoasCruzadas),
  );

  return {
    ...entradas,
    pessoas,
    organizacoes,
    pessoasCruzadas,
    mediaOrgsCruzadas,
    usuariosTestPlans,
    testersCruzados,
    stakeholders: inteiro(entradas.stakeholders, 0),
    minutosMes: decimal(entradas.minutosMes, 0),
    percentualSelfHosted: decimal(entradas.percentualSelfHosted, 0, 100),
    jobsMicrosoftPorOrg: inteiro(entradas.jobsMicrosoftPorOrg, 0),
    jobsSelfHostedPorOrg: inteiro(entradas.jobsSelfHostedPorOrg, 0),
    committersAtivos: inteiro(entradas.committersAtivos, 0),
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

function fechar(
  linhas: Linha[],
  cadeirasPagas: number,
  pessoas: number,
  cadeirasDuplicadas: number,
  avisos: string[],
): Resultado {
  const mensalUsd = linhas.reduce((soma, linha) => soma + linha.usd, 0);
  return {
    linhas,
    mensalUsd,
    anualUsd: mensalUsd * 12,
    porPessoaUsd: pessoas > 0 ? mensalUsd / pessoas : 0,
    cadeirasPagas,
    pessoas,
    cadeirasDuplicadas,
    avisos,
  };
}

function minutosHospedados(entradas: Entradas) {
  return entradas.minutosMes * (1 - entradas.percentualSelfHosted / 100);
}

function custoSeguranca(
  entradas: Entradas,
  committers: number,
  idCode: IdPreco,
  idSecret: IdPreco,
  precos: Precos,
): Linha[] {
  if (!entradas.ghas) return [];
  const linhas: Linha[] = [];
  if (entradas.codeSecurity) {
    linhas.push({
      rotulo: "Code Security",
      detalhe: `${committers} committers × ${dolar(precos[idCode])}`,
      usd: committers * precos[idCode],
    });
  }
  if (entradas.secretProtection) {
    linhas.push({
      rotulo: "Secret Protection",
      detalhe: `${committers} committers × ${dolar(precos[idSecret])}`,
      usd: committers * precos[idSecret],
    });
  }
  return linhas;
}

export function calcularAzure(
  bruto: Entradas,
  premissas: Premissas,
  precosBrutos: Precos = PRECOS_OFICIAIS,
): Resultado {
  const e = normalizar(bruto);
  const precos = normalizarPrecos(precosBrutos);
  const avisos: string[] = [];
  const multiOrg = premissas.multiOrg && premissas.mesmaAssinatura;
  if (premissas.multiOrg && !premissas.mesmaAssinatura) {
    avisos.push(
      "Multi-org billing só junta orgs da mesma assinatura Azure; a conta segue por org.",
    );
  }

  const exclusivas = e.pessoas - e.pessoasCruzadas;
  const atribuicoes = exclusivas + e.pessoasCruzadas * e.mediaOrgsCruzadas;
  const atribuicoesTestPlans =
    e.usuariosTestPlans - e.testersCruzados + e.testersCruzados * e.mediaOrgsCruzadas;

  let assentosTestPlans: number;
  let assentosBasic: number;
  if (multiOrg) {
    assentosTestPlans = e.usuariosTestPlans;
    const basicExtraDeTesters = premissas.testPlansEmUmaOrg ? e.testersCruzados : 0;
    assentosBasic = e.pessoas - e.usuariosTestPlans + basicExtraDeTesters;
    if (basicExtraDeTesters > 0) {
      avisos.push(
        `${basicExtraDeTesters} tester(s) com Basic + Test Plans numa org e Basic noutra pagam os dois.`,
      );
    }
  } else {
    assentosTestPlans = atribuicoesTestPlans;
    assentosBasic = atribuicoes - atribuicoesTestPlans;
  }

  const stakeholdersPagos = premissas.stakeholderGratis ? 0 : e.stakeholders;
  const basicCobravel = assentosBasic + stakeholdersPagos;
  const cotaGratis = premissas.cincoBasicGratis
    ? BASIC_GRATIS_POR_ORG * (multiOrg ? 1 : e.organizacoes)
    : 0;
  const gratis = Math.min(basicCobravel, cotaGratis);
  const basicPagos = basicCobravel - gratis;

  const linhas: Linha[] = [
    {
      rotulo: "Basic",
      detalhe: `${fmt(basicCobravel)} assentos − ${gratis} grátis × ${dolar(precos.azBasic)}`,
      usd: basicPagos * precos.azBasic,
    },
  ];
  if (assentosTestPlans > 0) {
    linhas.push({
      rotulo: "Basic + Test Plans",
      detalhe: `${fmt(assentosTestPlans)} assentos × ${dolar(precos.azTestPlans)}`,
      usd: assentosTestPlans * precos.azTestPlans,
    });
  }

  const minutosPorOrg = minutosHospedados(e) / e.organizacoes;
  let jobsMicrosoftPagos = e.jobsMicrosoftPorOrg;
  if (minutosPorOrg > 0 && jobsMicrosoftPagos === 0) {
    jobsMicrosoftPagos = 1;
  }
  const cotaCobre =
    premissas.cotaGratisMicrosoftHosted &&
    jobsMicrosoftPagos <= 1 &&
    minutosPorOrg <= MINUTOS_GRATIS_MICROSOFT_POR_ORG;
  if (cotaCobre) {
    jobsMicrosoftPagos = 0;
  } else if (
    premissas.cotaGratisMicrosoftHosted &&
    minutosPorOrg > MINUTOS_GRATIS_MICROSOFT_POR_ORG &&
    e.jobsMicrosoftPorOrg <= 1
  ) {
    avisos.push(
      `${fmt(minutosPorOrg)} min/mês por org passam da cota grátis de ${fmt(MINUTOS_GRATIS_MICROSOFT_POR_ORG)}: 1 job pago por org.`,
    );
  }
  const jobsSelfHostedPagos = Math.max(0, e.jobsSelfHostedPorOrg - JOBS_SELF_HOSTED_GRATIS_POR_ORG);

  if (jobsMicrosoftPagos > 0) {
    linhas.push({
      rotulo: "Jobs Microsoft-hosted",
      detalhe: `${e.organizacoes} org × ${jobsMicrosoftPagos} job × ${dolar(precos.azJobMicrosoft)}`,
      usd: e.organizacoes * jobsMicrosoftPagos * precos.azJobMicrosoft,
    });
  }
  if (jobsSelfHostedPagos > 0) {
    linhas.push({
      rotulo: "Jobs self-hosted",
      detalhe: `${e.organizacoes} org × ${jobsSelfHostedPagos} job extra × ${dolar(precos.azJobSelfHosted)}`,
      usd: e.organizacoes * jobsSelfHostedPagos * precos.azJobSelfHosted,
    });
  }

  const committersCruzados = Math.min(e.pessoasCruzadas, e.committersAtivos);
  const committers = premissas.mesmaAssinatura
    ? e.committersAtivos
    : e.committersAtivos + committersCruzados * (e.mediaOrgsCruzadas - 1);
  linhas.push(
    ...custoSeguranca(e, committers, "azCodeSecurity", "azSecretProtection", precos).map(
      (linha) => ({ ...linha, rotulo: `GHAzDO ${linha.rotulo}` }),
    ),
  );

  const cadeirasPagas = basicPagos + assentosTestPlans;
  const cadeirasDuplicadas = multiOrg
    ? assentosBasic + assentosTestPlans - e.pessoas
    : atribuicoes - e.pessoas;
  return fechar(linhas, cadeirasPagas, e.pessoas + stakeholdersPagos, cadeirasDuplicadas, avisos);
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

  const usuarios = e.pessoas + (premissas.stakeholdersNoGitHub ? e.stakeholders : 0);
  const linhas: Linha[] = [
    {
      rotulo: e.planoGitHub === "team" ? "GitHub Team" : "GitHub Enterprise",
      detalhe: `${usuarios} usuários × ${dolar(precos[idPlano])}`,
      usd: usuarios * precos[idPlano],
    },
  ];

  const minutos = minutosHospedados(e);
  const fator = premissas.multiplicadorDeSo ? multiplicador(e.runnerGitHub) : 1;
  const incluidos = premissas.minutosIncluidosGitHub ? minutosIncluidos(e.planoGitHub) / fator : 0;
  const excedente = Math.max(0, minutos - incluidos);
  linhas.push({
    rotulo: "Actions (minutos hospedados)",
    detalhe: `${fmt(excedente)} min além de ${fmt(incluidos)} incluídos × ${dolar(precos[idRunner])}`,
    usd: excedente * precos[idRunner],
  });
  if (e.percentualSelfHosted > 0) {
    avisos.push(
      `${fmt(e.percentualSelfHosted)}% dos minutos em runner self-hosted: sem custo no GitHub.`,
    );
  }

  linhas.push(
    ...custoSeguranca(e, e.committersAtivos, "ghCodeSecurity", "ghSecretProtection", precos),
  );
  if (!e.ghas) {
    avisos.push(
      "Sem GHAS, CodeQL em repositório privado não roda; gates abertos no Actions custam só minutos.",
    );
  }

  return fechar(linhas, usuarios, usuarios, 0, avisos);
}

export function comparar(
  entradas: Entradas,
  premissas: Premissas,
  precos: Precos = PRECOS_OFICIAIS,
): Comparacao {
  return {
    azure: calcularAzure(entradas, premissas, precos),
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
