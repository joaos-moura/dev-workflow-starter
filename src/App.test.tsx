import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import pipelineYml from "../.github/workflows/pipeline.yml?raw";
import { App } from "./App";

function regiao(nome: string) {
  return screen.getByRole("region", { name: nome });
}

describe("estrutura da página", () => {
  beforeEach(() => {
    render(<App />);
  });

  it("navega pelas âncoras das seções", () => {
    const nav = screen.getByRole("navigation", { name: "Seções" });
    const links = within(nav)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(links).toEqual([
      "#topo",
      "#desafio",
      "#solucao",
      "#portal",
      "#arquitetura",
      "#pipeline",
      "#radar",
      "#usar",
      "#usar",
    ]);
    for (const href of links) {
      expect(document.querySelector(href ?? "")).not.toBeNull();
    }
  });

  it("abre com o hero", () => {
    const hero = screen.getByRole("banner");
    expect(
      within(hero).getByRole("heading", { level: 1, name: "Do pedido ao ambiente, em minutos" }),
    ).toBeInTheDocument();
    expect(hero).toHaveTextContent("Padrão de plataforma · gratuito · open source");
    expect(hero).toHaveTextContent("preview por pull request");
    expect(within(hero).getByRole("link", { name: "Começar agora" })).toHaveAttribute(
      "href",
      "#usar",
    );
    expect(within(hero).getByRole("link", { name: "Ver arquitetura" })).toHaveAttribute(
      "href",
      "#arquitetura",
    );
  });

  it("segue a ordem final das onze seções", () => {
    const rotulos = screen.getAllByRole("region").map((secao) => secao.getAttribute("aria-label"));
    expect(rotulos).toEqual([
      "O desafio",
      "A solução",
      "O portal",
      "Padrão 360°",
      "Arquitetura",
      "Contas por ambiente",
      "Caminho feliz",
      "Pipeline",
      "Radar",
      "Hoje x Futuro",
      "Como usar",
    ]);
    const numeros = screen
      .getAllByRole("region")
      .map((secao) => secao.querySelector(".eyebrow")?.textContent?.slice(0, 2));
    expect(numeros).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"]);
  });

  it("cita a licença MIT do repositório no rodapé", () => {
    const rodape = screen.getByRole("contentinfo");
    expect(rodape).toHaveTextContent("Template gratuito · MIT");
  });
});

describe("seções da página", () => {
  beforeEach(() => {
    render(<App />);
  });

  it("renderiza o desafio com números ilustrativos", () => {
    const secao = regiao("O desafio");
    expect(
      within(secao).getByRole("heading", {
        name: "Um time sem ambiente de dev espera dias por cada serviço.",
      }),
    ).toBeInTheDocument();
    expect(secao).toHaveTextContent("empresa de médio porte");
    expect(secao).toHaveTextContent("homologação (HML)");
    expect(secao).toHaveTextContent("time de infraestrutura");
    expect(secao).toHaveTextContent("0contas Dev disponíveis");
    expect(secao).toHaveTextContent("4pedidos de acesso por serviço");
    expect(secao).toHaveTextContent("diasde espera na fila de governança");
    expect(within(secao).getByText("Números ilustrativos.")).toBeInTheDocument();
  });

  it("renderiza a solução", () => {
    const secao = regiao("A solução");
    expect(secao).toHaveTextContent("Sete peças, nenhum serviço pago.");
    for (const peca of [
      "Template",
      "Preview por pull request",
      "Ambiente dev fixo",
      "Devcontainer",
      "CI honesto + qualidade",
      "Deploy via OIDC",
    ]) {
      expect(within(secao).getByRole("heading", { name: peca })).toBeInTheDocument();
    }
    expect(secao).toHaveTextContent("Lint, teste e build; CodeQL, Dependabot e ESLint no PR.");
    expect(secao).toHaveTextContent("sem chave de acesso");
  });

  it("renderiza o portal com o formulário e os passos em background", () => {
    const secao = regiao("O portal");
    expect(secao).toHaveTextContent("O dev preenche três campos. O resto acontece sozinho.");
    expect(secao).toHaveTextContent("Backstage · Criar serviço");
    for (const campo of ["Nome do serviço", "Tipo de serviço", "Time", "Criar"]) {
      expect(within(secao).getByText(campo)).toBeInTheDocument();
    }
    for (const passo of [
      "Repositório criado",
      "Pipeline configurada",
      "Role OIDC criada",
      "Infra Dev provisionada",
      "Registrado no catálogo",
    ]) {
      expect(within(secao).getByText(passo)).toBeInTheDocument();
    }
    expect(secao).toHaveTextContent("Serviço no ar em Dev");
    expect(secao).toHaveTextContent("pagamentos-api.dev");
  });

  it("renderiza o padrão 360° com as dez camadas e os quatro princípios", () => {
    const secao = regiao("Padrão 360°");
    const camadas = within(secao)
      .getAllByRole("listitem")
      .map((item) => item.querySelector("b")?.textContent);
    expect(camadas).toEqual([
      "Cloud",
      "Runtime",
      "Git e CI",
      "Segurança",
      "Observabilidade",
      "Dados",
      "Portal",
      "IaC",
      "Trabalho",
      "Governança",
    ]);
    for (const principio of [
      "Autonomia",
      "Qualidade no dia a dia",
      "Integração",
      "IA com guardrails",
    ]) {
      expect(within(secao).getByRole("heading", { name: principio })).toBeInTheDocument();
    }
    expect(secao).toHaveTextContent("O GitHub é o hub");
    expect(secao).toHaveTextContent("CODEOWNERS");
  });

  it("renderiza a arquitetura", () => {
    const secao = regiao("Arquitetura");
    const diagrama = within(secao).getByRole("figure");
    for (const no of [
      "Backstage",
      "GitHub",
      "GitHub Actions",
      "OIDC",
      "Conta AWS · Dev",
      "Terraform",
      "S3 + Lambda",
    ]) {
      expect(within(diagrama).getByText(no)).toBeInTheDocument();
    }
    expect(diagrama).toHaveTextContent("use_lockfile");
    expect(diagrama).toHaveTextContent("ok: true");
    expect(secao).toHaveTextContent("ECS Fargate");
    expect(secao).toHaveTextContent("GitHub Pages");
  });

  it("renderiza as contas por ambiente", () => {
    const secao = regiao("Contas por ambiente");
    for (const conta of ["Dev", "HML", "PRD", "Shared"]) {
      expect(within(secao).getByText(conta)).toBeInTheDocument();
    }
    expect(secao).toHaveTextContent("preview por PR + dev fixo");
    expect(secao).toHaveTextContent("opcional");
    expect(secao).toHaveTextContent("sem usuários IAM");
    expect(secao).toHaveTextContent("sem chaves de acesso pessoais");
    expect(secao).toHaveTextContent("AWS SSO · papéis por repositório · sem usuário IAM");
  });

  it("renderiza o caminho feliz", () => {
    const secao = regiao("Caminho feliz");
    expect(within(secao).getByRole("heading", { name: "Um produto por vez." })).toBeInTheDocument();
    expect(within(secao).getAllByRole("listitem")).toHaveLength(4);
    expect(secao).toHaveTextContent("portal ou o template");
    expect(secao).toHaveTextContent("plan no PR");
    expect(secao).toHaveTextContent("apply na conta Dev");
    expect(secao).toHaveTextContent("GitHub Actions, via OIDC");
    expect(secao).toHaveTextContent("health da API");
  });

  it("renderiza o pipeline antes e depois", () => {
    const secao = regiao("Pipeline");
    expect(within(secao).getByRole("heading", { name: "Antes e depois." })).toBeInTheDocument();
    expect(secao).toHaveTextContent("Antes · trava em HML");
    expect(secao).toHaveTextContent("HML · fila");
    expect(secao).toHaveTextContent("Depois · flui");
    expect(secao).toHaveTextContent("Merge → Dev");
    expect(within(secao).getByRole("heading", { name: "Antes" })).toBeInTheDocument();
    expect(within(secao).getByRole("heading", { name: "Depois" })).toBeInTheDocument();
    expect(secao).toHaveTextContent("Só existe HML.");
    expect(secao).toHaveTextContent("A governança de acesso à AWS trava o serviço.");
    expect(secao).toHaveTextContent("O devcontainer prepara o local em minutos.");
    expect(secao).toHaveTextContent("⏱ dias");
    expect(secao).toHaveTextContent("⏱ minutos");
  });

  it("lista a esteira antiga e a nova, estágio por estágio", () => {
    const secao = regiao("Pipeline");
    const estagios = (titulo: string) => {
      const coluna = within(secao).getByRole("heading", { name: titulo }).parentElement;
      if (!coluna) throw new Error(`Coluna ${titulo} ausente.`);
      return within(coluna)
        .getAllByRole("listitem")
        .map((item) => item.firstChild?.textContent);
    };
    expect(estagios("Esteira antes")).toEqual([
      "Detecção",
      "Gates 1–4",
      "Testes e cobertura",
      "CI Build, scan e push ECR",
      "CD HML",
      "Perf HML (Datadog APM)",
      "CD PRD",
    ]);
    expect(estagios("Esteira depois")).toEqual([
      "Detecção de tecnologia",
      "Gates de segurança",
      "Testes e cobertura",
      "Build e scan",
      "Preview PR",
      "CD Dev",
      "CD HML",
      "Perf HML",
      "CD PRD",
    ]);
    expect(secao).toHaveTextContent("CodeQL, Dependabot, secret scan, reviewdog");
    expect(secao).toHaveTextContent("na versão empresa");
  });

  it("renderiza o radar", () => {
    const secao = regiao("Radar");
    expect(within(secao).getByRole("img", { name: /três anéis/ })).toBeInTheDocument();
    expect(secao.querySelectorAll(".bl")).toHaveLength(12);
    for (const anel of ["Adotar", "Avaliar", "Segurar"]) {
      expect(within(secao).getByRole("heading", { name: anel })).toBeInTheDocument();
    }
    for (const item of [
      "Terraform",
      "GitHub Actions",
      "React",
      "Node",
      "Postgres",
      "ECS Fargate",
      "Next",
      ".NET",
      "Backstage",
    ]) {
      expect(secao).toHaveTextContent(item);
    }
    expect(secao).toHaveTextContent("Datadogna versão empresa");
    expect(secao).toHaveTextContent("GitHub Enterprisena versão empresa");
    expect(secao).toHaveTextContent("GitHub Advanced Securityna versão empresa");
  });

  it("renderiza hoje x futuro com as treze camadas", () => {
    const secao = regiao("Hoje x Futuro");
    const tabela = within(secao).getByRole("table");
    const linhas = within(tabela).getAllByRole("row").slice(1);
    expect(linhas).toHaveLength(13);
    const mudam = linhas.filter((linha) => linha.classList.contains("star"));
    expect(mudam).toHaveLength(11);
    const iguais = linhas
      .filter((linha) => !linha.classList.contains("star"))
      .map((linha) => within(linha).getByRole("rowheader").textContent);
    expect(iguais).toEqual(["Cloud", "Trabalho"]);
    expect(tabela).toHaveTextContent("Backstage como golden path");
    expect(tabela).toHaveTextContent("ECS Fargate; EKS só em avaliação");
  });

  it("renderiza como usar", () => {
    const secao = regiao("Como usar");
    expect(secao).toHaveTextContent("Do template ao preview em seis passos.");
    expect(within(secao).getAllByRole("listitem")).toHaveLength(6);
    expect(secao).toHaveTextContent("novo-projeto");
    expect(secao).toHaveTextContent("devcontainer");
    expect(secao).toHaveTextContent("bucket de estado");
    expect(secao).toHaveTextContent("workspace dev");
    expect(secao).toHaveTextContent("GitHub Pages");
    expect(secao).toHaveTextContent("O workspace do preview é destruído.");
    expect(secao).toHaveTextContent("use_lockfile");
    expect(secao).toHaveTextContent("URL da API na Lambda");
  });

  it("usa no terminal a mesma variável de repositório que os workflows leem", () => {
    const codigo = regiao("Como usar").querySelector("pre code");
    expect(codigo?.textContent).toContain("gh variable set AWS_ROLE_ARN \\\n  --body");
    expect(codigo?.textContent).toContain('"arn:aws:iam::<conta>:role/github-<repo>-deploy"');
    expect(pipelineYml).toContain("${{ vars.AWS_ROLE_ARN }}");
    expect(pipelineYml).not.toContain("secrets.AWS_ROLE_ARN");
  });
});

describe("promessa de inércia", () => {
  it("avisa que a AWS não recebe recurso sem a variável", () => {
    render(<App />);
    expect(
      screen.getByText(/Nada é criado na AWS enquanto a variável AWS_ROLE_ARN não existir\./),
    ).toBeInTheDocument();
  });
});
