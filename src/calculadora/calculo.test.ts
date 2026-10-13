import { describe, expect, it } from "vitest";
import {
  ENTRADAS_PADRAO,
  PREMISSAS_PADRAO,
  calcularAzure,
  calcularGitHub,
  comparar,
  converter,
  formatarMoeda,
  frasesDeCadeiras,
  normalizar,
  type Entradas,
  type Premissas,
} from "./calculo";
import { FICHAS, PRECOS_OFICIAIS, VERIFICADO_EM, origemDoPreco } from "./precos";

function entradas(parcial: Partial<Entradas> = {}): Entradas {
  return { ...ENTRADAS_PADRAO, ...parcial };
}

function premissas(parcial: Partial<Premissas> = {}): Premissas {
  return { ...PREMISSAS_PADRAO, ...parcial };
}

function linha(resultado: ReturnType<typeof calcularAzure>, rotulo: string) {
  return resultado.linhas.find((item) => item.rotulo === rotulo)?.usd ?? 0;
}

describe("cenário inicial", () => {
  it("parte de uma org com 20 pessoas, sem acesso cruzado", () => {
    expect(ENTRADAS_PADRAO.pessoas).toBe(20);
    expect(ENTRADAS_PADRAO.organizacoes).toBe(1);
    expect(ENTRADAS_PADRAO.pessoasCruzadas).toBe(0);
    expect(PREMISSAS_PADRAO.multiOrg).toBe(false);
    expect(PREMISSAS_PADRAO.cincoBasicGratis).toBe(true);
  });

  it("liga GHAS só no GitHub, com 20 committers ativos", () => {
    expect(ENTRADAS_PADRAO.ghasGitHub).toBe(true);
    expect(ENTRADAS_PADRAO.ghazdo).toBe(false);
    expect(ENTRADAS_PADRAO.codeSecurity).toBe(true);
    expect(ENTRADAS_PADRAO.secretProtection).toBe(true);
    expect(ENTRADAS_PADRAO.committersAtivos).toBe(ENTRADAS_PADRAO.pessoas);
  });

  it("cobra 15 Basic e 1 job Microsoft-hosted no Azure DevOps, sem GHAzDO", () => {
    const azure = calcularAzure(ENTRADAS_PADRAO, PREMISSAS_PADRAO);
    expect(azure.linhas.some((item) => item.rotulo.startsWith("GHAzDO"))).toBe(false);
    expect(linha(azure, "Basic")).toBe(15 * 6);
    expect(linha(azure, "Jobs Microsoft-hosted")).toBe(40);
    expect(azure.mensalUsd).toBe(130);
    expect(azure.anualUsd).toBe(1560);
    expect(azure.cadeirasDuplicadas).toBe(0);
    expect(frasesDeCadeiras(azure)).toBe("15 cadeiras pagas para 20 pessoas");
  });

  it("cobra 20 assentos Team, o excedente de minutos e GHAS no GitHub", () => {
    const github = calcularGitHub(ENTRADAS_PADRAO, PREMISSAS_PADRAO);
    expect(linha(github, "GitHub Team")).toBe(80);
    expect(linha(github, "Actions (minutos hospedados)")).toBeCloseTo(3000 * 0.006);
    expect(linha(github, "Code Security")).toBe(20 * 30);
    expect(linha(github, "Secret Protection")).toBe(20 * 19);
    expect(github.mensalUsd).toBeCloseTo(1078);
    expect(github.anualUsd).toBeCloseTo(12936);
    expect(github.porPessoaUsd).toBeCloseTo(53.9);
    expect(github.avisos.join(" ")).not.toContain("CodeQL");
    expect(frasesDeCadeiras(github)).toBe("20 cadeiras pagas para 20 pessoas");
  });
});

describe("várias orgs com acesso cruzado", () => {
  const cenario = entradas({
    pessoas: 20,
    organizacoes: 5,
    pessoasCruzadas: 8,
    mediaOrgsCruzadas: 3,
    minutosMes: 0,
  });

  it("cobra uma cadeira por org em que a pessoa cruzada entra", () => {
    const azure = calcularAzure(cenario, PREMISSAS_PADRAO);
    expect(azure.cadeirasDuplicadas).toBe(16);
    expect(linha(azure, "Basic")).toBe((12 + 8 * 3 - 25) * 6);
    expect(frasesDeCadeiras(azure)).toBe("11 cadeiras pagas para 20 pessoas");
  });

  it("sem os 5 grátis, mostra todas as 36 cadeiras para 20 pessoas", () => {
    const azure = calcularAzure(cenario, premissas({ cincoBasicGratis: false }));
    expect(linha(azure, "Basic")).toBe(36 * 6);
    expect(frasesDeCadeiras(azure)).toBe("36 cadeiras pagas para 20 pessoas");
  });

  it("com multi-org billing, cobra cada pessoa uma vez e 5 grátis por assinatura", () => {
    const azure = calcularAzure(cenario, premissas({ multiOrg: true }));
    expect(azure.cadeirasDuplicadas).toBe(0);
    expect(linha(azure, "Basic")).toBe((20 - 5) * 6);
    expect(frasesDeCadeiras(azure)).toBe("15 cadeiras pagas para 20 pessoas");
  });

  it("ignora multi-org billing quando as orgs não dividem a assinatura", () => {
    const azure = calcularAzure(cenario, premissas({ multiOrg: true, mesmaAssinatura: false }));
    expect(azure.cadeirasDuplicadas).toBe(16);
    expect(azure.avisos.join(" ")).toContain("mesma assinatura");
  });

  it("no GitHub, cada pessoa paga uma cadeira só", () => {
    const github = calcularGitHub(cenario, PREMISSAS_PADRAO);
    expect(github.cadeirasPagas).toBe(20);
    expect(github.cadeirasDuplicadas).toBe(0);
  });

  it("não deixa a média passar do número de orgs", () => {
    const normal = normalizar(
      entradas({ organizacoes: 3, pessoasCruzadas: 4, mediaOrgsCruzadas: 9 }),
    );
    expect(normal.mediaOrgsCruzadas).toBe(3);
  });

  it("zera o acesso cruzado quando há uma org só", () => {
    const normal = normalizar(entradas({ organizacoes: 1, pessoasCruzadas: 6 }));
    expect(normal.pessoasCruzadas).toBe(0);
    expect(normal.mediaOrgsCruzadas).toBe(1);
  });
});

describe("Test Plans", () => {
  it("cobra Basic + Test Plans à parte do Basic", () => {
    const azure = calcularAzure(
      entradas({ usuariosTestPlans: 4, minutosMes: 0 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(azure, "Basic + Test Plans")).toBe(4 * 52);
    expect(linha(azure, "Basic")).toBe((16 - 5) * 6);
  });

  it("por org, tester cruzado paga Test Plans em cada org", () => {
    const cenario = entradas({
      organizacoes: 2,
      pessoasCruzadas: 2,
      mediaOrgsCruzadas: 2,
      usuariosTestPlans: 3,
      testersCruzados: 2,
      minutosMes: 0,
    });
    const azure = calcularAzure(cenario, PREMISSAS_PADRAO);
    expect(linha(azure, "Basic + Test Plans")).toBe(5 * 52);
  });

  it("com multi-org, tester com Basic noutra org paga os dois (limitação documentada)", () => {
    const cenario = entradas({
      organizacoes: 2,
      pessoasCruzadas: 2,
      mediaOrgsCruzadas: 2,
      usuariosTestPlans: 3,
      testersCruzados: 2,
      minutosMes: 0,
    });
    const comLimite = calcularAzure(cenario, premissas({ multiOrg: true }));
    expect(linha(comLimite, "Basic + Test Plans")).toBe(3 * 52);
    expect(linha(comLimite, "Basic")).toBe((17 + 2 - 5) * 6);
    expect(comLimite.cadeirasDuplicadas).toBe(2);

    const semLimite = calcularAzure(
      cenario,
      premissas({ multiOrg: true, testPlansEmUmaOrg: false }),
    );
    expect(linha(semLimite, "Basic")).toBe((17 - 5) * 6);
  });
});

describe("Stakeholder", () => {
  it("é grátis no Azure DevOps por padrão e ocupa assento no GitHub", () => {
    const cenario = entradas({ stakeholders: 10, minutosMes: 0 });
    expect(linha(calcularAzure(cenario, PREMISSAS_PADRAO), "Basic")).toBe(15 * 6);
    expect(calcularGitHub(cenario, PREMISSAS_PADRAO).cadeirasPagas).toBe(30);
  });

  it("vira Basic pago quando a premissa é desligada", () => {
    const cenario = entradas({ stakeholders: 10, minutosMes: 0 });
    const azure = calcularAzure(cenario, premissas({ stakeholderGratis: false }));
    expect(linha(azure, "Basic")).toBe(25 * 6);
    expect(calcularGitHub(cenario, premissas({ stakeholdersNoGitHub: false })).cadeirasPagas).toBe(
      20,
    );
  });
});

describe("pipelines no Azure DevOps", () => {
  it("a cota grátis cobre 1 job até 1.800 min por org", () => {
    const azure = calcularAzure(entradas({ minutosMes: 1800 }), PREMISSAS_PADRAO);
    expect(linha(azure, "Jobs Microsoft-hosted")).toBe(0);
  });

  it("acima de 1.800 min por org, cobra 1 job em cada org", () => {
    const azure = calcularAzure(entradas({ minutosMes: 9000, organizacoes: 2 }), PREMISSAS_PADRAO);
    expect(linha(azure, "Jobs Microsoft-hosted")).toBe(2 * 40);
    expect(azure.avisos.join(" ")).toContain("cota grátis");
  });

  it("dividir os minutos entre orgs pode manter cada uma na cota grátis", () => {
    const azure = calcularAzure(entradas({ minutosMes: 3000, organizacoes: 2 }), PREMISSAS_PADRAO);
    expect(linha(azure, "Jobs Microsoft-hosted")).toBe(0);
  });

  it("2 jobs paralelos saindo da cota grátis custam 2 jobs", () => {
    const azure = calcularAzure(
      entradas({ minutosMes: 100, jobsMicrosoftPorOrg: 2 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(azure, "Jobs Microsoft-hosted")).toBe(80);
  });

  it("sem a cota grátis, todo job Microsoft-hosted é pago", () => {
    const azure = calcularAzure(
      entradas({ minutosMes: 100 }),
      premissas({ cotaGratisMicrosoftHosted: false }),
    );
    expect(linha(azure, "Jobs Microsoft-hosted")).toBe(40);
  });

  it("o primeiro job self-hosted é grátis em cada org", () => {
    const azure = calcularAzure(
      entradas({ minutosMes: 0, organizacoes: 2, jobsSelfHostedPorOrg: 3 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(azure, "Jobs self-hosted")).toBe(2 * 2 * 15);
  });

  it("minutos em self-hosted saem da conta Microsoft-hosted", () => {
    const azure = calcularAzure(
      entradas({ minutosMes: 6000, percentualSelfHosted: 100 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(azure, "Jobs Microsoft-hosted")).toBe(0);
  });
});

describe("Actions no GitHub", () => {
  it("Enterprise inclui 50.000 minutos", () => {
    const github = calcularGitHub(
      entradas({ planoGitHub: "enterprise", minutosMes: 60000 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(github, "GitHub Enterprise")).toBe(20 * 21);
    expect(linha(github, "Actions (minutos hospedados)")).toBeCloseTo(10000 * 0.006);
  });

  it("usa a tarifa do runner escolhido", () => {
    const github = calcularGitHub(
      entradas({ runnerGitHub: "windows-2", minutosMes: 4000 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(github, "Actions (minutos hospedados)")).toBeCloseTo(1000 * 0.01);
  });

  it("o multiplicador antigo de SO reduz os minutos incluídos", () => {
    const cenario = entradas({ runnerGitHub: "macos", minutosMes: 1000 });
    expect(linha(calcularGitHub(cenario, PREMISSAS_PADRAO), "Actions (minutos hospedados)")).toBe(
      0,
    );
    const antigo = calcularGitHub(cenario, premissas({ multiplicadorDeSo: true }));
    expect(linha(antigo, "Actions (minutos hospedados)")).toBeCloseTo(700 * 0.062);
  });

  it("sem minutos incluídos, cobra todos os minutos", () => {
    const github = calcularGitHub(
      entradas({ minutosMes: 1000 }),
      premissas({ minutosIncluidosGitHub: false }),
    );
    expect(linha(github, "Actions (minutos hospedados)")).toBeCloseTo(6);
  });

  it("runner self-hosted não gasta minuto pago", () => {
    const github = calcularGitHub(
      entradas({ minutosMes: 10000, percentualSelfHosted: 100 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(github, "Actions (minutos hospedados)")).toBe(0);
  });
});

describe("GHAS", () => {
  it("cobra Code Security e Secret Protection por committer ativo nos dois lados", () => {
    const cenario = entradas({ ghazdo: true, committersAtivos: 12, minutosMes: 0 });
    const { azure, github } = comparar(cenario, PREMISSAS_PADRAO);
    expect(linha(azure, "GHAzDO Code Security")).toBe(12 * 30);
    expect(linha(azure, "GHAzDO Secret Protection")).toBe(12 * 19);
    expect(linha(github, "Code Security")).toBe(12 * 30);
    expect(linha(github, "Secret Protection")).toBe(12 * 19);
  });

  it("permite só um dos produtos", () => {
    const github = calcularGitHub(
      entradas({ codeSecurity: false, committersAtivos: 10 }),
      PREMISSAS_PADRAO,
    );
    expect(linha(github, "Code Security")).toBe(0);
    expect(linha(github, "Secret Protection")).toBe(190);
  });

  it("fora da mesma assinatura, o committer cruzado conta em cada org", () => {
    const cenario = entradas({
      ghazdo: true,
      codeSecurity: true,
      secretProtection: false,
      organizacoes: 3,
      pessoasCruzadas: 5,
      mediaOrgsCruzadas: 2,
      committersAtivos: 20,
    });
    expect(linha(calcularAzure(cenario, PREMISSAS_PADRAO), "GHAzDO Code Security")).toBe(20 * 30);
    expect(
      linha(calcularAzure(cenario, premissas({ mesmaAssinatura: false })), "GHAzDO Code Security"),
    ).toBe(25 * 30);
  });

  it("cada lado liga e desliga sozinho", () => {
    const soAzure = comparar(entradas({ ghasGitHub: false, ghazdo: true }), PREMISSAS_PADRAO);
    expect(linha(soAzure.azure, "GHAzDO Code Security")).toBe(20 * 30);
    expect(soAzure.github.linhas.some((item) => item.rotulo.includes("Security"))).toBe(false);
  });

  it("desligado no GitHub, não cobra e avisa sobre CodeQL em repositório privado", () => {
    const github = calcularGitHub(entradas({ ghasGitHub: false }), PREMISSAS_PADRAO);
    expect(github.linhas.some((item) => item.rotulo.includes("Security"))).toBe(false);
    expect(github.avisos.join(" ")).toContain("CodeQL");
  });
});

describe("moeda", () => {
  it("converte para real com o câmbio informado", () => {
    expect(converter(100, "USD", 5)).toBe(100);
    expect(converter(100, "BRL", 5.0096)).toBeCloseTo(500.96);
  });

  it("formata em pt-BR", () => {
    expect(formatarMoeda(1560, "USD")).toMatch(/US\$\s1\.560,00/);
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

  it("marca como estimativa o preço editado", () => {
    expect(origemDoPreco("azBasic", PRECOS_OFICIAIS.azBasic)).toBe("oficial");
    expect(origemDoPreco("azBasic", 7)).toBe("estimativa");
  });

  it("os preços editados entram na conta", () => {
    const azure = calcularAzure(entradas({ minutosMes: 0 }), PREMISSAS_PADRAO, {
      ...PRECOS_OFICIAIS,
      azBasic: 10,
    });
    expect(linha(azure, "Basic")).toBe(150);
  });

  it("preço apagado no campo conta como zero, sem NaN", () => {
    const azure = calcularAzure(ENTRADAS_PADRAO, PREMISSAS_PADRAO, {
      ...PRECOS_OFICIAIS,
      azBasic: Number.NaN,
    });
    expect(azure.mensalUsd).toBe(40);
  });
});
