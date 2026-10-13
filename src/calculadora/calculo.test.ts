import { describe, expect, it } from "vitest";
import {
  CAPACIDADE_AZURE_ATUAL,
  CENARIO_ATUAL_AZURE,
  ENTRADAS_PADRAO,
  PREMISSAS_PADRAO,
  calcularAzureAtual,
  calcularGitHub,
  capacidadeGitHub,
  comparar,
  converter,
  formatarMoeda,
  frasesDeCadeiras,
  MINUTOS_PADRAO,
  jobsSelfHostedAzure,
  jobsSimultaneos,
  jobsSimultaneosAzure,
  minutosIncluidos,
  normalizar,
  upgradeGhas,
  type Entradas,
  type Premissas,
  type Resultado,
} from "./calculo";
import { CITACOES } from "./premissas";
import {
  FICHAS,
  FONTES,
  PRECOS_OFICIAIS,
  VERIFICADO_EM,
  origemDoPreco,
  precoEditavel,
} from "./precos";

function entradas(parcial: Partial<Entradas> = {}): Entradas {
  return { ...ENTRADAS_PADRAO, ...parcial };
}

function premissas(parcial: Partial<Premissas> = {}): Premissas {
  return { ...PREMISSAS_PADRAO, ...parcial };
}

function linha(resultado: Resultado, inicio: string) {
  return resultado.linhas.find((item) => item.rotulo.startsWith(inicio))?.usd ?? 0;
}

describe("Azure DevOps · cenário atual (fixo)", () => {
  it("é 1 org, 20 pessoas, 1 job Microsoft-hosted pago, 3 self-hosted e sem GHAzDO", () => {
    expect(CENARIO_ATUAL_AZURE).toEqual({
      organizacoes: 1,
      pessoas: 20,
      jobsMicrosoftPagos: 1,
      jobsSelfHostedGratis: 1,
      jobsSelfHostedPagos: 2,
      ghazdo: false,
    });
    expect(jobsSelfHostedAzure()).toBe(3);
  });

  it("cobra 15 Basic, 1 job Microsoft-hosted e 2 self-hosted extras", () => {
    const azure = calcularAzureAtual();
    expect(azure.linhas.map((item) => item.rotulo)).toEqual([
      "Basic · 15 pagos, 5 grátis",
      "Job Microsoft-hosted · 1 pago",
      "Jobs self-hosted · 2 pagos, 1 grátis",
      "GHAzDO",
    ]);
    expect(linha(azure, "Basic")).toBe(15 * 6);
    expect(linha(azure, "Job Microsoft-hosted")).toBe(40);
    expect(linha(azure, "Jobs self-hosted")).toBe(2 * 15);
    expect(linha(azure, "GHAzDO")).toBe(0);
    expect(azure.mensalUsd).toBe(160);
    expect(azure.anualUsd).toBe(1920);
    expect(azure.porPessoaUsd).toBe(8);
    expect(azure.cadeirasGratis).toBe(5);
    expect(frasesDeCadeiras(azure)).toBe("15 cadeiras pagas para 20 pessoas");
  });

  it("o job pago não tem teto mensal de minutos", () => {
    const job = calcularAzureAtual().linhas[1];
    expect(job?.detalhe).toContain("Sem limite mensal de minutos, até 360 min por job");
    expect(job?.detalhe).not.toContain("1.800");
  });

  it("avisa que as máquinas self-hosted ficam fora da conta", () => {
    expect(calcularAzureAtual().avisos.join(" ")).toContain(
      "Fora da conta: o custo das máquinas dos agentes self-hosted",
    );
  });

  it("confere os preços oficiais dos jobs com a página de preços", () => {
    expect(PRECOS_OFICIAIS.azJobMicrosoft).toBe(40);
    expect(PRECOS_OFICIAIS.azJobSelfHosted).toBe(15);
    expect(CITACOES.precoJobs.fonte).toBe(FONTES.azurePrecos);
    expect(CITACOES.precoJobs.texto).toContain("$40 per extra Microsoft-hosted");
    expect(CITACOES.precoJobs.texto).toContain("$15 per extra self-hosted");
  });

  it("não muda com as entradas nem com os preços do GitHub", () => {
    const outra = comparar(
      entradas({ pessoas: 80, minutosMes: 90000, planoGitHub: "enterprise" }),
      PREMISSAS_PADRAO,
      { ...PRECOS_OFICIAIS, ghTeam: 99 },
    );
    expect(outra.azure.mensalUsd).toBe(160);
  });

  it("descreve a capacidade como até 4 jobs simultâneos, só 1 em máquina da Microsoft", () => {
    expect(jobsSimultaneosAzure()).toBe(4);
    expect(CAPACIDADE_AZURE_ATUAL.titulo).toBe("1 hosted + 3 self-hosted = até 4 jobs simultâneos");
    expect(CAPACIDADE_AZURE_ATUAL.detalhe).toContain("Só 1 em máquina da Microsoft");
    expect(CITACOES.concorrencia.texto).toBe(
      "If you have one parallel job, you can run one pipeline job at a time. If you have five parallel jobs, you can run five pipeline jobs at a time.",
    );
    expect(CITACOES.concorrencia.fonte).toBe(FONTES.azureJobs);
  });
});

describe("GitHub no padrão", () => {
  it("parte de 20 pessoas no Team, GHAS desligado e 20 committers ativos", () => {
    expect(ENTRADAS_PADRAO.pessoas).toBe(20);
    expect(ENTRADAS_PADRAO.planoGitHub).toBe("team");
    expect(ENTRADAS_PADRAO.ghas).toBe(false);
    expect(ENTRADAS_PADRAO.codeSecurity).toBe(true);
    expect(ENTRADAS_PADRAO.secretProtection).toBe(true);
    expect(ENTRADAS_PADRAO.committersAtivos).toBe(20);
    expect(ENTRADAS_PADRAO.minutosMes).toBe(MINUTOS_PADRAO);
    expect(MINUTOS_PADRAO).toBe(1800);
  });

  it("cobra 20 assentos, nenhum minuto excedente e nada de GHAS", () => {
    const github = calcularGitHub(ENTRADAS_PADRAO, PREMISSAS_PADRAO);
    expect(linha(github, "GitHub Team")).toBe(80);
    expect(linha(github, "Actions")).toBe(0);
    expect(github.linhas.find((item) => item.rotulo.startsWith("Actions"))?.detalhe).toContain(
      "1.800 min usados, 3.000 incluídos, 0 excedentes",
    );
    expect(github.linhas.map((item) => item.rotulo)).not.toContain("Code Security");
    expect(github.mensalUsd).toBe(80);
    expect(github.anualUsd).toBe(960);
    expect(github.porPessoaUsd).toBe(4);
    expect(github.cadeirasGratis).toBe(0);
    expect(github.avisos.join(" ")).toContain("CodeQL");
    expect(frasesDeCadeiras(github)).toBe("20 cadeiras pagas para 20 pessoas");
  });

  it("mostra o preço do GHAS como upgrade, calculado pelos committers", () => {
    expect(upgradeGhas(ENTRADAS_PADRAO)).toEqual({
      usd: 20 * (30 + 19),
      produtos: "Code Security + Secret Protection",
    });
    expect(upgradeGhas(entradas({ committersAtivos: 8 })).usd).toBe(8 * 49);
    expect(upgradeGhas(entradas({ secretProtection: false }))).toEqual({
      usd: 20 * 30,
      produtos: "Code Security",
    });
    expect(upgradeGhas(entradas({ codeSecurity: false, secretProtection: false }))).toEqual({
      usd: 0,
      produtos: "",
    });
  });

  it("com GHAS ligado, cobra o upgrade por committer", () => {
    const github = calcularGitHub(entradas({ ghas: true }), PREMISSAS_PADRAO);
    expect(linha(github, "Code Security")).toBe(20 * 30);
    expect(linha(github, "Secret Protection")).toBe(20 * 19);
    expect(github.mensalUsd).toBe(80 + upgradeGhas(ENTRADAS_PADRAO).usd);
    expect(github.mensalUsd).toBe(1060);
  });

  it("permite só um dos produtos do GHAS", () => {
    const github = calcularGitHub(entradas({ ghas: true, codeSecurity: false }), PREMISSAS_PADRAO);
    expect(linha(github, "Code Security")).toBe(0);
    expect(linha(github, "Secret Protection")).toBe(380);
  });

  it("não conta mais committers do que pessoas", () => {
    expect(normalizar(entradas({ pessoas: 10, committersAtivos: 30 })).committersAtivos).toBe(10);
  });
});

describe("Actions no GitHub", () => {
  it("cobra o excedente acima dos 3.000 minutos do Team", () => {
    const github = calcularGitHub(entradas({ minutosMes: 6000 }), PREMISSAS_PADRAO);
    expect(linha(github, "Actions")).toBeCloseTo(3000 * 0.006);
  });

  it("Enterprise inclui 50.000 minutos", () => {
    const github = calcularGitHub(
      entradas({ planoGitHub: "enterprise", minutosMes: 60000 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(github, "GitHub Enterprise")).toBe(20 * 21);
    expect(linha(github, "Actions")).toBeCloseTo(10000 * 0.006);
  });

  it("usa a tarifa do runner escolhido", () => {
    const github = calcularGitHub(
      entradas({ runnerGitHub: "windows-2", minutosMes: 4000 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(github, "Actions")).toBeCloseTo(1000 * 0.01);
  });

  it("o multiplicador antigo de SO reduz os minutos incluídos", () => {
    const cenario = entradas({ runnerGitHub: "macos", minutosMes: 1000 });
    expect(linha(calcularGitHub(cenario, PREMISSAS_PADRAO), "Actions")).toBe(0);
    const antigo = calcularGitHub(cenario, premissas({ multiplicadorDeSo: true }));
    expect(linha(antigo, "Actions")).toBeCloseTo(700 * 0.062);
  });

  it("sem minutos incluídos, cobra todos os minutos", () => {
    const github = calcularGitHub(
      entradas({ minutosMes: 1000 }),
      premissas({ minutosIncluidosGitHub: false }),
    );
    expect(linha(github, "Actions")).toBeCloseTo(6);
  });

  it("runner self-hosted não gasta minuto pago", () => {
    const github = calcularGitHub(
      entradas({ minutosMes: 10000, percentualSelfHosted: 100 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(github, "Actions")).toBe(0);
  });
});

describe("capacidade de pipeline", () => {
  it("segue o plano: minutos incluídos e jobs simultâneos da documentação", () => {
    expect(minutosIncluidos("team")).toBe(3000);
    expect(minutosIncluidos("enterprise")).toBe(50000);
    expect(jobsSimultaneos("team")).toEqual({ total: 60, macos: 5 });
    expect(jobsSimultaneos("enterprise")).toEqual({ total: 500, macos: 50 });
    expect(capacidadeGitHub("team", "linux-2").titulo).toBe(
      "3.000 minutos inclusos + 60 jobs simultâneos",
    );
    expect(capacidadeGitHub("enterprise", "linux-2").titulo).toBe(
      "50.000 minutos inclusos + 500 jobs simultâneos",
    );
  });

  it("avisa o limite de macOS quando o runner é macOS", () => {
    expect(capacidadeGitHub("team", "macos").detalhe).toContain("macOS limitado a 5");
    expect(capacidadeGitHub("enterprise", "macos").detalhe).toContain("macOS limitado a 50");
  });

  it("cita a tabela de limites do GitHub Actions", () => {
    expect(CITACOES.jobsGitHub.fonte).toBe(FONTES.githubLimites);
    expect(CITACOES.jobsGitHub.texto).toContain("Team | 60 | 5");
    expect(CITACOES.jobsGitHub.texto).toContain("Enterprise | 500 | 50");
    expect(CITACOES.minutosGitHub.texto).toContain("GitHub Team | 3,000");
  });
});

describe("moeda", () => {
  it("converte para real com o câmbio informado", () => {
    expect(converter(100, "USD", 5)).toBe(100);
    expect(converter(100, "BRL", 5.0096)).toBeCloseTo(500.96);
  });

  it("formata em pt-BR", () => {
    expect(formatarMoeda(1080, "USD")).toMatch(/US\$\s1\.080,00/);
    expect(formatarMoeda(500.96, "BRL")).toMatch(/R\$\s500,96/);
  });
});

describe("tabela de preços", () => {
  it("toda ficha tem fonte oficial e a data de verificação", () => {
    expect(VERIFICADO_EM).toBe("13/10/2026");
    for (const ficha of FICHAS) {
      expect(ficha.fonte).toMatch(
        /^https:\/\/(azure\.microsoft\.com|learn\.microsoft\.com|github\.com|docs\.github\.com)\//,
      );
    }
  });

  it("só os preços do GitHub são editáveis", () => {
    for (const ficha of FICHAS) {
      expect(precoEditavel(ficha)).toBe(ficha.plataforma === "GitHub");
    }
  });

  it("marca como estimativa o preço editado", () => {
    expect(origemDoPreco("ghTeam", PRECOS_OFICIAIS.ghTeam)).toBe("oficial");
    expect(origemDoPreco("ghTeam", 7)).toBe("estimativa");
  });

  it("os preços editados do GitHub entram na conta, e campo vazio conta como zero", () => {
    expect(
      calcularGitHub(entradas({ ghas: false }), PREMISSAS_PADRAO, {
        ...PRECOS_OFICIAIS,
        ghTeam: 10,
      }).mensalUsd,
    ).toBe(200);
    expect(
      calcularGitHub(entradas({ ghas: false }), PREMISSAS_PADRAO, {
        ...PRECOS_OFICIAIS,
        ghTeam: Number.NaN,
      }).mensalUsd,
    ).toBe(0);
  });
});
