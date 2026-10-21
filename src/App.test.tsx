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
      "#pipeline",
      "#pr",
      "#ghas",
      "#promocao",
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
    expect(hero).toHaveTextContent("Padrão de plataforma · open source");
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

  it("segue a ordem final das seções", () => {
    const rotulos = screen
      .getAllByRole("region")
      .filter((secao) => secao.tagName === "SECTION")
      .map((secao) => secao.getAttribute("aria-label"));
    expect(rotulos).toEqual([
      "O desafio",
      "A solução",
      "O portal",
      "Padrão 360°",
      "Arquitetura",
      "Contas por ambiente",
      "Caminho feliz",
      "Pipeline",
      "No PR",
      "GHAS",
      "Promoção",
      "Radar",
      "Hoje x Futuro",
      "Como usar",
    ]);
    const numeros = [...document.querySelectorAll("section .eyebrow")].map((eyebrow) =>
      eyebrow.textContent?.slice(0, 2),
    );
    expect(numeros).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
    ]);
  });

  it("cita a licença MIT do repositório no rodapé", () => {
    const rodape = screen.getByRole("contentinfo");
    expect(rodape).toHaveTextContent("Template · MIT");
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
    expect(secao).toHaveTextContent("Sete peças do mesmo fluxo.");
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

  it("mostra o erro em HML no fluxo antigo e no PR no fluxo novo", () => {
    const secao = regiao("Pipeline");
    expect(
      within(secao).getByRole("heading", { name: "O erro muda de lugar." }),
    ).toBeInTheDocument();
    const diagrama = secao.querySelector("[data-diagrama='antes-depois']");
    if (!diagrama) throw new Error("diagrama antes/depois ausente");
    expect(diagrama).toHaveAttribute("aria-describedby", "nota-antes nota-depois");
    expect(secao).toHaveTextContent("Erro só em HML · dias");
    expect(secao).toHaveTextContent("Erro pego no PR, em minutos, e corrigido antes do build");
    expect(secao.querySelector(".lane.b .stop.x")).toHaveTextContent("HML");
    expect(secao.querySelector(".lane.a .stop.cedo")).toHaveTextContent("PR");
    expect(secao.querySelectorAll(".lane.a .tok")).toHaveLength(1);
  });

  it("explica o PR, o GHAS e a promoção com rótulos curtos", () => {
    const pr = regiao("No PR");
    expect(within(pr).getByRole("heading", { name: "Pronto antes do merge." })).toBeInTheDocument();
    expect(pr).toHaveTextContent("Ilustração");
    expect(pr).toHaveTextContent("O que já está pronto quando o PR abre");
    for (const nome of ["Lint", "Testes", "CodeQL", "Secret scan", "Dependências"]) {
      expect(within(pr).getByText(nome)).toBeInTheDocument();
    }
    expect(pr).toHaveTextContent("check obrigatório");
    expect(pr).toHaveTextContent("SHA · Trivy · build único");
    expect(pr).toHaveTextContent("reviewdog");

    const ghas = regiao("GHAS");
    expect(within(ghas).getByText("Push protection")).toBeInTheDocument();
    expect(ghas).toHaveTextContent("Anota a linha nova no diff");
    expect(ghas).toHaveTextContent("Dependency review");
    expect(ghas).toHaveTextContent("Licença: só se a action negar");
    expect(ghas).toHaveTextContent("Merge travado");
    expect(ghas).toHaveTextContent("Code scanning: limiar de severidade");
    expect(ghas).toHaveTextContent("Security and quality");
    expect(ghas).toHaveTextContent("Overview é da organização");
    expect(ghas).toHaveTextContent("Dependabot alerta no ramo padrão");
    expect(ghas).toHaveTextContent("Não é um check do PR");

    const promocao = regiao("Promoção");
    expect(promocao.querySelector("[data-diagrama='promocao']")).toHaveAttribute(
      "data-estado",
      "animando",
    );
    expect(promocao).toHaveTextContent("ECR · mesma imagem · smoke");
    expect(promocao).toHaveTextContent("p95 · erro · para se piorar");
    expect(promocao).toHaveTextContent("Canário");
    expect(promocao).toHaveTextContent("Rollback automático");
    expect(promocao).toHaveTextContent("Sem rebuild");
    expect(promocao).toHaveTextContent("OIDC · um papel por conta");
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
