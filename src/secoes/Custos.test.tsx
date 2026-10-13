import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { FICHAS, FONTES } from "../calculadora/precos";
import estilos from "../styles.css?raw";
import { Custos } from "./Custos";

function campo(rotulo: string) {
  return screen.getByLabelText(rotulo);
}

function digitar(rotulo: string, valor: string) {
  fireEvent.change(campo(rotulo), { target: { value: valor } });
}

describe("seção de custos", () => {
  beforeEach(() => {
    render(<Custos />);
  });

  it("abre no cenário de uma org com 20 pessoas", () => {
    expect(campo("Pessoas (devs)")).toHaveValue(20);
    expect(campo("Organizações Azure DevOps")).toHaveValue(1);
    expect(campo("Devs com acesso cruzado")).toBeDisabled();
    expect(screen.getByRole("switch", { name: /Multi-org billing ativo/ })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: /Primeiros 5 Basic grátis/ })).toBeChecked();
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("US$ 130,00");
    expect(screen.getByTestId("anual-az")).toHaveTextContent("US$ 1.560,00");
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 1.078,00");
    expect(screen.getByTestId("anual-gh")).toHaveTextContent("US$ 12.936,00");
    expect(screen.getByRole("switch", { name: /GHAS no GitHub/ })).toBeChecked();
    expect(screen.getByRole("switch", { name: /GHAzDO no Azure DevOps/ })).not.toBeChecked();
    expect(campo("Committers ativos (90 dias)")).toHaveValue(20);
    expect(campo("Committers ativos (90 dias)")).toBeEnabled();
    expect(screen.getByRole("article", { name: "Azure DevOps" })).toHaveTextContent(
      "15 cadeiras pagas para 20 pessoas",
    );
    expect(screen.getByRole("article", { name: "Azure DevOps" })).not.toHaveTextContent("GHAzDO");
  });

  it("mostra a duplicação de cadeiras com acesso cruzado e some com multi-org", () => {
    digitar("Organizações Azure DevOps", "5");
    digitar("Devs com acesso cruzado", "8");
    digitar("Média de orgs por dev cruzado", "3");
    const azure = screen.getByRole("article", { name: "Azure DevOps" });
    expect(azure).toHaveTextContent("11 cadeiras pagas para 20 pessoas");
    expect(azure).toHaveTextContent("+16 por acesso cruzado");
    expect(screen.getByRole("article", { name: "GitHub" })).toHaveTextContent(
      "20 cadeiras pagas para 20 pessoas",
    );

    fireEvent.click(screen.getByRole("switch", { name: /Multi-org billing ativo/ }));
    expect(azure).toHaveTextContent("15 cadeiras pagas para 20 pessoas");
    expect(azure).not.toHaveTextContent("por acesso cruzado");
  });

  it("converte para real com câmbio editável", () => {
    fireEvent.click(screen.getByRole("radio", { name: "R$" }));
    digitar("Câmbio (R$ por US$)", "5");
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("R$ 650,00");
  });

  it("liga e desliga GHAS em cada lado, cobrando por committer", () => {
    fireEvent.click(screen.getByRole("switch", { name: /GHAzDO no Azure DevOps/ }));
    expect(screen.getByRole("article", { name: "Azure DevOps" })).toHaveTextContent(
      "GHAzDO Code Security",
    );
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("US$ 1.110,00");

    fireEvent.click(screen.getByRole("switch", { name: /GHAS no GitHub/ }));
    expect(screen.getByRole("article", { name: "GitHub" })).not.toHaveTextContent("Code Security");
    expect(screen.getByTestId("mensal-gh")).toHaveTextContent("US$ 98,00");

    fireEvent.click(screen.getByRole("switch", { name: /GHAzDO no Azure DevOps/ }));
    expect(campo("Committers ativos (90 dias)")).toBeDisabled();
  });

  it("lista cada preço com fonte, data e selo oficial", () => {
    const tabela = screen.getByRole("table");
    expect(tabela).toHaveTextContent("verificados em 13/10/2026");
    const linhas = within(tabela).getAllByRole("row").slice(1);
    expect(linhas).toHaveLength(FICHAS.length);
    for (const linha of linhas) {
      expect(linha).toHaveTextContent("oficial");
      expect(within(linha).getByRole("link")).toHaveAttribute(
        "href",
        expect.stringMatching(/^https:\/\//),
      );
    }
  });

  it("marca como estimativa o preço editado", () => {
    const preco = screen.getByLabelText("Preço de Basic (do 6º usuário em diante)");
    fireEvent.change(preco, { target: { value: "7" } });
    const linha = preco.closest("tr");
    expect(linha).toHaveTextContent("estimativa");
    expect(screen.getByTestId("mensal-az")).toHaveTextContent("US$ 145,00");
  });

  it("cita a fonte de cada premissa e do câmbio", () => {
    const premissas = screen.getByRole("heading", { name: "Premissas" }).parentElement;
    if (!premissas) throw new Error("Premissas ausentes.");
    expect(within(premissas).getAllByRole("switch")).toHaveLength(9);
    expect(within(premissas).getAllByRole("link", { name: "Fonte" })).toHaveLength(9);
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
