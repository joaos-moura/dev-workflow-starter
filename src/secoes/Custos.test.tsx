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
    expect(fixo).toHaveTextContent("Jobs paralelos1");
    expect(fixo).toHaveTextContent("GHAzDOnão usado");
    expect(screen.queryByLabelText("Organizações Azure DevOps")).toBeNull();
    expect(screen.queryByLabelText("Devs com acesso cruzado")).toBeNull();
    expect(screen.queryByRole("switch", { name: /Multi-org billing/ })).toBeNull();
  });

  it("explica o que é grátis e o que é pago, e a cobrança por org, com citação e fonte", () => {
    const fixo = azureFixo();
    for (const citacao of [
      CITACOES.basicGratis,
      CITACOES.jobMicrosoftGratis,
      CITACOES.jobSelfHostedGratis,
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
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("US$ 90,00");
    expect(screen.getByTestId("anual-az")).toHaveTextContent("US$ 1.080,00");
    expect(azure).toHaveTextContent("15 cadeiras pagas para 20 pessoas · 5 grátis");
    expect(azure).toHaveTextContent("1 job paralelo · grátis");

    expect(campo("Pessoas (devs)")).toHaveValue(20);
    expect(campo("Committers ativos (90 dias)")).toHaveValue(20);
    expect(screen.getByRole("switch", { name: /GHAS ligado/ })).toBeChecked();
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 1.060,00");
    expect(screen.getByTestId("anual-gh")).toHaveTextContent("US$ 12.720,00");
  });

  it("o destaque de capacidade segue o plano escolhido", () => {
    const destaque = screen.getByTestId("capacidade-gh");
    expect(destaque).toHaveTextContent("3.000 minutos inclusos + 60 jobs simultâneos");
    fireEvent.click(screen.getByRole("radio", { name: "Enterprise" }));
    expect(destaque).toHaveTextContent("50.000 minutos inclusos + 500 jobs simultâneos");
    fireEvent.click(screen.getByRole("radio", { name: "Team" }));
    expect(destaque).toHaveTextContent("3.000 minutos inclusos + 60 jobs simultâneos");

    const azure = screen.getByRole("article", { name: "Capacidade do Azure DevOps" });
    expect(azure).toHaveTextContent("1 job, fila única");
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
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("US$ 90,00");
  });

  it("desliga GHAS no GitHub", () => {
    fireEvent.click(screen.getByRole("switch", { name: /GHAS ligado/ }));
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 80,00");
    expect(campo("Committers ativos (90 dias)")).toBeDisabled();
  });

  it("converte para real com câmbio editável", () => {
    fireEvent.click(screen.getByRole("radio", { name: "R$" }));
    digitar("Câmbio (R$ por US$)", "5");
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("R$ 450,00");
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("R$ 5.300,00");
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
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 1.080,00");
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
