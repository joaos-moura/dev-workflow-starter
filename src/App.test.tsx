import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

function regiao(nome: string) {
  return screen.getByRole("region", { name: nome });
}

describe("seções da página", () => {
  beforeEach(() => {
    render(<App />);
  });

  it("renderiza o desafio", () => {
    const secao = regiao("O desafio");
    expect(secao).toHaveTextContent("HML");
    expect(secao).toHaveTextContent("homologação");
    expect(secao).toHaveTextContent("conta Dev");
    expect(secao).toHaveTextContent("time de infraestrutura");
    expect(secao).toHaveTextContent("governança de acesso");
    expect(secao).toHaveTextContent("dias");
  });

  it("renderiza a solução", () => {
    const secao = regiao("A solução");
    expect(secao).toHaveTextContent("Template");
    expect(secao).toHaveTextContent("pull request");
    expect(secao).toHaveTextContent("dev fixo");
    expect(secao).toHaveTextContent("Devcontainer");
    expect(secao).toHaveTextContent("lint, teste e build");
    expect(secao).toHaveTextContent("CodeQL");
    expect(secao).toHaveTextContent("OIDC");
  });

  it("renderiza o padrão 360°", () => {
    const secao = regiao("Padrão 360°");
    for (const camada of [
      "Cloud",
      "Runtime",
      "Git e CI",
      "Segurança",
      "Observabilidade",
      "Dados",
      "Portal",
      "IaC",
      "Trabalho",
      "Governança AWS",
    ]) {
      expect(secao).toHaveTextContent(camada);
    }
  });

  it("renderiza os quatro objetivos", () => {
    const secao = regiao("Quatro objetivos");
    expect(within(secao).getByRole("heading", { name: "Autonomia" })).toBeInTheDocument();
    expect(
      within(secao).getByRole("heading", { name: "Qualidade no dia a dia" }),
    ).toBeInTheDocument();
    expect(within(secao).getByRole("heading", { name: "Integração" })).toBeInTheDocument();
    expect(within(secao).getByRole("heading", { name: "IA com guardrails" })).toBeInTheDocument();
    expect(secao).toHaveTextContent("conta Dev");
    expect(secao).toHaveTextContent("GitHub é o hub");
  });

  it("renderiza a arquitetura", () => {
    const secao = regiao("Arquitetura");
    expect(
      within(secao).getByRole("img", {
        name: "Fluxo do GitHub ao Actions, OIDC, S3, Lambda e Pages",
      }),
    ).toBeInTheDocument();
    expect(secao).toHaveTextContent("OIDC");
    expect(secao).toHaveTextContent("S3");
    expect(secao).toHaveTextContent("Lambda");
    expect(secao).toHaveTextContent("GitHub Pages");
    expect(secao).toHaveTextContent("ECS Fargate");
    expect(secao).toHaveTextContent("ok: true");
  });

  it("renderiza as contas por ambiente", () => {
    const secao = regiao("Contas por ambiente");
    expect(
      within(secao).getByRole("img", {
        name: "Contas Dev, HML, PRD e Shared com acesso por SSO",
      }),
    ).toBeInTheDocument();
    expect(secao).toHaveTextContent("Dev");
    expect(secao).toHaveTextContent("HML");
    expect(secao).toHaveTextContent("PRD");
    expect(secao).toHaveTextContent("Shared");
    expect(secao).toHaveTextContent("SSO");
    expect(secao).toHaveTextContent("sem usuários IAM");
    expect(secao).toHaveTextContent("sem chaves de acesso pessoais");
  });

  it("renderiza o caminho feliz", () => {
    const secao = regiao("Caminho feliz");
    expect(secao).toHaveTextContent("portal ou o template");
    expect(secao).toHaveTextContent("plan no pull request");
    expect(secao).toHaveTextContent("apply na conta Dev");
    expect(secao).toHaveTextContent("GitHub Actions, via OIDC");
    expect(secao).toHaveTextContent("health da API");
    expect(within(secao).getByText("Um produto por vez.")).toBeInTheDocument();
  });

  it("renderiza o radar", () => {
    const secao = regiao("Radar");
    expect(within(secao).getByRole("heading", { name: "Adotar" })).toBeInTheDocument();
    expect(within(secao).getByRole("heading", { name: "Avaliar" })).toBeInTheDocument();
    expect(within(secao).getByRole("heading", { name: "Segurar" })).toBeInTheDocument();
    expect(secao).toHaveTextContent("Terraform");
    expect(secao).toHaveTextContent("GitHub Actions");
    expect(secao).toHaveTextContent("Backstage");
    expect(secao).toHaveTextContent("React");
    expect(secao).toHaveTextContent("Next");
    expect(secao).toHaveTextContent(".NET");
    expect(secao).toHaveTextContent("Node");
    expect(secao).toHaveTextContent("Postgres");
    expect(secao).toHaveTextContent("ECS Fargate");
    expect(secao).toHaveTextContent("Datadog — na versão empresa");
    expect(secao).toHaveTextContent("GitHub Enterprise — na versão empresa");
    expect(secao).toHaveTextContent("GitHub Advanced Security — na versão empresa");
  });

  it("renderiza o antes e depois", () => {
    const secao = regiao("Antes e depois");
    expect(within(secao).getByRole("heading", { name: "Antes" })).toBeInTheDocument();
    expect(within(secao).getByRole("heading", { name: "Depois" })).toBeInTheDocument();
    expect(secao).toHaveTextContent("A espera dura dias.");
    expect(secao).toHaveTextContent("pronto em minutos");
  });

  it("renderiza como usar", () => {
    const secao = regiao("Como usar");
    expect(secao).toHaveTextContent("novo-projeto");
    expect(secao).toHaveTextContent("devcontainer");
    expect(secao).toHaveTextContent("AWS_ROLE_ARN");
    expect(secao).toHaveTextContent("bucket de estado");
    expect(secao).toHaveTextContent("workspace dev");
    expect(secao).toHaveTextContent("GitHub Pages");
    expect(secao).toHaveTextContent("destrói o workspace do preview");
  });
});

describe("promessa de inércia", () => {
  it("avisa que a AWS não recebe recurso sem a variável", () => {
    render(<App />);
    expect(
      screen.getByText("Nada é criado na AWS enquanto a variável AWS_ROLE_ARN não existir."),
    ).toBeInTheDocument();
  });
});
