import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CITACOES } from "../calculadora/premissas";
import { FICHAS, FONTES } from "../calculadora/precos";
import estilos from "../styles.css?raw";
import { Custos } from "./Custos";

function campo(rotulo: string) {
  return screen.getByLabelText(rotulo);
}

function digitar(rotulo: string, valor: string) {
  fireEvent.change(campo(rotulo), { target: { value: valor } });
}

function azureFixo() {
  return screen.getByRole("group", { name: "Azure DevOps · Cenário atual" });
}

describe("seção de custos", () => {
  beforeEach(() => {
    render(<Custos />);
  });

  it("mostra o Azure DevOps como cenário atual fixo, sem campo editável", () => {
    const fixo = azureFixo();
    expect(within(fixo).queryAllByRole("spinbutton")).toEqual([]);
    expect(within(fixo).queryAllByRole("switch")).toEqual([]);
    expect(within(fixo).queryAllByRole("textbox")).toEqual([]);
    expect(fixo).toHaveTextContent("Organizações1");
    expect(fixo).toHaveTextContent("Pessoas (Basic)20");
    expect(fixo).toHaveTextContent("Job Microsoft-hosted1 pago");
    expect(fixo).toHaveTextContent("Jobs self-hosted3 (1 grátis + 2 pagos)");
    expect(fixo).toHaveTextContent("GHAzDOnão usado");
    expect(fixo).toHaveTextContent("Não incluído: o custo das máquinas");
    expect(fixo).not.toHaveTextContent("1.800");
    expect(screen.queryByLabelText("Organizações Azure DevOps")).toBeNull();
    expect(screen.queryByLabelText("Devs com acesso cruzado")).toBeNull();
    expect(screen.queryByRole("switch", { name: /Multi-org billing/ })).toBeNull();
  });

  it("explica o que é grátis e o que é pago, e a cobrança por org, com citação e fonte", () => {
    const fixo = azureFixo();
    for (const citacao of [
      CITACOES.basicGratis,
      CITACOES.precoJobs,
      CITACOES.jobMicrosoftPago,
      CITACOES.limitePago,
      CITACOES.jobSelfHostedGratis,
      CITACOES.selfHostedPorJob,
      CITACOES.porOrg,
      CITACOES.multiOrg,
    ]) {
      expect(fixo).toHaveTextContent(citacao.texto);
      expect(fixo.querySelector(`blockquote[cite="${citacao.fonte}"]`)).not.toBeNull();
    }
    expect(fixo).toHaveTextContent("multi-org billing");
  });

  it("abre com os valores padrão dos dois lados", () => {
    const azure = screen.getByRole("article", { name: "Azure DevOps · Cenário atual" });
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("US$ 160,00");
    expect(screen.getByTestId("anual-az")).toHaveTextContent("US$ 1.920,00");
    expect(azure).toHaveTextContent("15 cadeiras pagas para 20 pessoas · 5 grátis");
    expect(azure).toHaveTextContent("Job Microsoft-hosted · 1 pago");
    expect(azure).toHaveTextContent("Jobs self-hosted · 2 pagos, 1 grátis");
    expect(azure).toHaveTextContent("Fora da conta: o custo das máquinas");

    expect(campo("Pessoas (devs)")).toHaveValue(20);
    expect(campo("Minutos de pipeline por mês")).toHaveValue(1800);
    expect(campo("Committers ativos (90 dias)")).toHaveValue(20);
    expect(screen.getByRole("switch", { name: /GHAS ligado/ })).not.toBeChecked();
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 80,00");
    expect(screen.getByTestId("anual-gh")).toHaveTextContent("US$ 960,00");
  });

  it("mostra o GHAS como upgrade opcional com preço calculado pelos committers", () => {
    const upgrade = screen.getByTestId("upgrade-ghas");
    expect(upgrade).toHaveTextContent(
      "opcional +US$ 980,00/mês com Code Security + Secret Protection",
    );
    expect(screen.getByRole("switch", { name: /GHAS ligado/ }).closest("label")).toHaveTextContent(
      "+US$ 980,00/mês com Code Security + Secret Protection",
    );
    digitar("Committers ativos (90 dias)", "10");
    expect(upgrade).toHaveTextContent("+US$ 490,00/mês");
    fireEvent.click(screen.getByRole("switch", { name: "Secret Protection" }));
    expect(upgrade).toHaveTextContent("+US$ 300,00/mês com Code Security");
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 80,00");
  });

  it("o destaque de capacidade segue o plano escolhido", () => {
    const destaque = screen.getByTestId("capacidade-gh");
    expect(destaque).toHaveTextContent("3.000 minutos inclusos + 60 jobs simultâneos");
    fireEvent.click(screen.getByRole("radio", { name: "Enterprise" }));
    expect(destaque).toHaveTextContent("50.000 minutos inclusos + 500 jobs simultâneos");
    fireEvent.click(screen.getByRole("radio", { name: "Team" }));
    expect(destaque).toHaveTextContent("3.000 minutos inclusos + 60 jobs simultâneos");

    const azure = screen.getByRole("article", { name: "Capacidade do Azure DevOps" });
    expect(azure).toHaveTextContent("1 hosted + 3 self-hosted = até 4 jobs simultâneos");
    expect(azure).toHaveTextContent("Só 1 em máquina da Microsoft");
    expect(azure).not.toHaveTextContent("fila única");
    expect(azure).toHaveTextContent(CITACOES.concorrencia.texto);
    expect(azure.querySelector(`blockquote[cite="${FONTES.azureJobs}"]`)).not.toBeNull();
    const github = screen.getByRole("article", { name: "Capacidade do GitHub" });
    expect(github.querySelector(`blockquote[cite="${FONTES.githubLimites}"]`)).not.toBeNull();
  });

  it("os committers acompanham as pessoas até serem editados", () => {
    digitar("Pessoas (devs)", "30");
    expect(campo("Committers ativos (90 dias)")).toHaveValue(30);
    digitar("Committers ativos (90 dias)", "12");
    digitar("Pessoas (devs)", "40");
    expect(campo("Committers ativos (90 dias)")).toHaveValue(12);
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("US$ 160,00");
  });

  it("liga GHAS no GitHub e o upgrade entra no total", () => {
    fireEvent.click(screen.getByRole("switch", { name: /GHAS ligado/ }));
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 1.060,00");
    expect(screen.queryByTestId("upgrade-ghas")).toBeNull();
    fireEvent.click(screen.getByRole("switch", { name: /GHAS ligado/ }));
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 80,00");
  });

  it("converte para real com câmbio editável", () => {
    fireEvent.click(screen.getByRole("radio", { name: "R$" }));
    digitar("Câmbio (R$ por US$)", "5");
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("R$ 800,00");
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("R$ 400,00");
    expect(screen.getByTestId("upgrade-ghas")).toHaveTextContent("+R$ 4.900,00/mês");
  });

  it("lista cada preço com fonte e selo oficial; só o GitHub é editável", () => {
    const tabela = screen.getByRole("table");
    expect(tabela).toHaveTextContent("verificados em 13/10/2026");
    const linhas = within(tabela).getAllByRole("row").slice(1);
    expect(linhas).toHaveLength(FICHAS.length);
    for (const [indice, linha] of linhas.entries()) {
      expect(linha).toHaveTextContent("oficial");
      expect(within(linha).getByRole("link")).toHaveAttribute(
        "href",
        expect.stringMatching(/^https:\/\//),
      );
      const editavel = FICHAS[indice]?.plataforma === "GitHub";
      expect(within(linha).queryAllByRole("spinbutton")).toHaveLength(editavel ? 1 : 0);
    }
  });

  it("marca como estimativa o preço do GitHub editado", () => {
    const preco = screen.getByLabelText("Preço de GitHub Team");
    fireEvent.change(preco, { target: { value: "5" } });
    expect(preco.closest("tr")).toHaveTextContent("estimativa");
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 100,00");
  });

  it("cita a fonte das premissas do GitHub e do câmbio", () => {
    const github = screen.getByRole("form", { name: "GitHub" });
    expect(within(github).getAllByRole("link", { name: "Fonte" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Banco Central" })).toHaveAttribute(
      "href",
      FONTES.ptax,
    );
  });
});

describe("movimento da calculadora", () => {
  it("não esconde nada fora do .mov e tem movimento reduzido próprio", () => {
    const bloco = estilos.slice(estilos.indexOf("/* Custos */"));
    expect(bloco).not.toMatch(/opacity:\s*0;/);
    expect(bloco).not.toMatch(/!important/);
    expect(bloco).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.barras i \{\s*transition: opacity 0\.3s ease;/,
    );
  });
});
