import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { ativarMovimento, CLASSE_MOVIMENTO, PRAZO_DO_OBSERVADOR_MS } from "./movimento";
import estilos from "./styles.css?raw";

type Retorno = (entradas: Partial<IntersectionObserverEntry>[]) => void;

const observados: { alvo: Element; retorno: Retorno; limiar: number }[] = [];

class ObservadorFalso {
  private readonly retorno: Retorno;
  private readonly opcoes?: IntersectionObserverInit;

  constructor(retorno: Retorno, opcoes?: IntersectionObserverInit) {
    this.retorno = retorno;
    this.opcoes = opcoes;
  }
  observe(alvo: Element) {
    observados.push({ alvo, retorno: this.retorno, limiar: Number(this.opcoes?.threshold ?? 0) });
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function simularPreferencia(menosMovimento: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (consulta: string) =>
      ({
        matches: menosMovimento && consulta.includes("reduce"),
        media: consulta,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

function entrarNaTela(alvo: Element | null) {
  act(() => {
    for (const registro of observados.filter((r) => r.alvo === alvo)) {
      registro.retorno([{ isIntersecting: true, target: registro.alvo }]);
    }
  });
}

function regiao(nome: string) {
  return screen.getByRole("region", { name: nome });
}

beforeEach(() => {
  observados.length = 0;
  vi.stubGlobal("IntersectionObserver", ObservadorFalso);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("com movimento", () => {
  beforeEach(() => {
    simularPreferencia(false);
  });

  it("revela títulos e blocos uma vez, ao cruzar 15% da tela", () => {
    render(<App />);
    const titulo = within(regiao("A solução")).getByRole("heading", { level: 2 });
    expect(titulo).toHaveClass("rv");
    expect(titulo).not.toHaveClass("vis");
    expect(observados.find((r) => r.alvo === titulo)?.limiar).toBe(0.15);

    entrarNaTela(titulo);
    expect(titulo).toHaveClass("rv", "vis");
  });

  it("conta as estatísticas do desafio a partir de zero", () => {
    vi.useFakeTimers();
    render(<App />);
    const grade = regiao("O desafio").querySelector(".grid");
    expect(grade).toHaveTextContent("4pedidos de acesso");

    entrarNaTela(grade);
    expect(grade).toHaveTextContent("0pedidos de acesso");
    act(() => vi.advanceTimersByTime(180 * 2));
    expect(grade).toHaveTextContent("2pedidos de acesso");
    act(() => vi.advanceTimersByTime(180 * 5));
    expect(grade).toHaveTextContent("4pedidos de acesso");
  });

  it("digita o formulário do portal e conclui os passos em background", async () => {
    vi.useFakeTimers();
    render(<App />);
    const portal = regiao("O portal");
    const demo = portal.querySelector(".portal");
    const campos = portal.querySelectorAll(".in");
    expect(observados.find((r) => r.alvo === demo && r.limiar === 0.4)).toBeDefined();
    expect(campos[0]).toHaveTextContent("pagamentos-api");

    entrarNaTela(demo);
    const avancar = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
    await avancar(500 + 70 * 4);
    expect(campos[0]).toHaveClass("f");
    expect(campos[0]).toHaveTextContent(/^pag/);

    await avancar(10_000);
    expect(campos[2]).toHaveTextContent("checkout");
    expect(portal.querySelectorAll(".st.on")).toHaveLength(5);
    expect(portal.querySelector(".done")).toHaveClass("on");

    await avancar(300);
    expect(campos[0]).toHaveTextContent(/^$/);
    expect(portal.querySelectorAll(".st.on")).toHaveLength(0);
  });

  it("solta os blips do radar com 110 ms entre eles", () => {
    render(<App />);
    const blips = [...regiao("Radar").querySelectorAll<HTMLElement>(".bl")];
    expect(blips.map((blip) => blip.style.transitionDelay)).toEqual(
      blips.map((_, indice) => `${indice * 110}ms`),
    );
  });

  it("desliza as linhas da tabela com 60 ms de stagger", () => {
    render(<App />);
    const linhas = [...regiao("Hoje x Futuro").querySelectorAll<HTMLElement>("tbody tr")];
    expect(linhas.at(-1)?.style.transitionDelay).toBe(`${12 * 60}ms`);
  });
});

describe("com prefers-reduced-motion", () => {
  beforeEach(() => {
    simularPreferencia(true);
  });

  it("continua revelando e animando o portal, só com movimento mais leve", async () => {
    vi.useFakeTimers();
    render(<App />);
    const titulo = within(regiao("A solução")).getByRole("heading", { level: 2 });
    expect(observados.find((r) => r.alvo === titulo)).toBeDefined();
    entrarNaTela(titulo);
    expect(titulo).toHaveClass("vis");

    const portal = regiao("O portal");
    entrarNaTela(portal.querySelector(".portal"));
    await act(() => vi.advanceTimersByTimeAsync(500 + 70 * 3));
    expect(portal.querySelector(".in")).toHaveTextContent(/^pa/);
  });
});

function regrasDoCss(css: string) {
  const semKeyframes = css.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  return [...semKeyframes.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, seletor, corpo]) => ({
    seletores: (seletor ?? "")
      .replace(/@media[^{]*$/, "")
      .split(",")
      .map((parte) => parte.trim())
      .filter(Boolean),
    corpo: corpo ?? "",
  }));
}

function blocoReduzido(css: string) {
  const inicio = css.indexOf("@media (prefers-reduced-motion: reduce)");
  expect(inicio).toBeGreaterThan(-1);
  const fim = css.indexOf("\n}\n", inicio);
  return css.slice(inicio, fim);
}

describe("o conteúdo nunca fica invisível", () => {
  it("só esconde para animar depois que o JS liga a classe .mov", () => {
    const escondem = regrasDoCss(estilos).filter(({ corpo }) => /opacity:\s*0;/.test(corpo));
    expect(escondem.length).toBeGreaterThan(0);
    for (const { seletores } of escondem) {
      for (const seletor of seletores) {
        expect(seletor.startsWith(".done") || seletor.startsWith(`.${CLASSE_MOVIMENTO} `)).toBe(
          true,
        );
      }
    }
  });

  it("deixa os blocos visíveis no CSS sem a classe .mov e esconde com ela", () => {
    const estilo = document.createElement("style");
    estilo.textContent = estilos.replace(/@import[^;]+;/g, "");
    document.head.append(estilo);
    render(<App />);
    const bloco = regiao("A solução").querySelector(".grid");
    if (!bloco) throw new Error("Grade da solução ausente.");
    expect(bloco).not.toHaveClass("vis");
    expect(getComputedStyle(bloco).opacity).toBe("1");

    document.documentElement.classList.add(CLASSE_MOVIMENTO);
    expect(getComputedStyle(bloco).opacity).toBe("0");

    document.documentElement.classList.remove(CLASSE_MOVIMENTO);
    estilo.remove();
  });

  it("liga .mov só quando há IntersectionObserver", () => {
    const comObservador = document.createElement("html");
    expect(ativarMovimento(comObservador)).toBe(true);
    expect(comObservador).toHaveClass(CLASSE_MOVIMENTO);

    vi.stubGlobal("IntersectionObserver", undefined);
    const semObservador = document.createElement("html");
    expect(ativarMovimento(semObservador)).toBe(false);
    expect(semObservador).not.toHaveClass(CLASSE_MOVIMENTO);
  });

  it("revela tudo se o observador não responder no prazo", () => {
    vi.useFakeTimers();
    simularPreferencia(false);
    render(<App />);
    const blocos = [...document.querySelectorAll(".rv")];
    expect(blocos.length).toBeGreaterThan(20);
    expect(blocos.filter((bloco) => bloco.classList.contains("vis"))).toHaveLength(0);

    act(() => vi.advanceTimersByTime(PRAZO_DO_OBSERVADOR_MS - 1));
    expect(document.querySelectorAll(".rv.vis")).toHaveLength(0);
    act(() => vi.advanceTimersByTime(1));
    expect(document.querySelectorAll(".rv:not(.vis)")).toHaveLength(0);

    const portal = regiao("O portal");
    const textos = [...portal.querySelectorAll(".in")].map((campo) => campo.textContent);
    expect(textos).toEqual(["pagamentos-api", "API · Node", "checkout"]);
    expect(portal.querySelector(".done")).toHaveClass("on");
  });

  it("não dispara o fallback com a aba em segundo plano", () => {
    vi.useFakeTimers();
    const visibilidade = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    render(<App />);
    act(() => vi.advanceTimersByTime(PRAZO_DO_OBSERVADOR_MS * 3));
    expect(document.querySelectorAll(".rv.vis")).toHaveLength(0);

    visibilidade.mockReturnValue("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(PRAZO_DO_OBSERVADOR_MS);
    });
    expect(document.querySelectorAll(".rv:not(.vis)")).toHaveLength(0);
    visibilidade.mockRestore();
  });

  it("com movimento reduzido, mantém a pipeline animando e não zera tudo", () => {
    const reduzido = blocoReduzido(estilos);
    expect(reduzido).not.toMatch(/animation:\s*none\s*!important/);
    expect(reduzido).not.toMatch(/transition:\s*none\s*!important/);
    expect(reduzido).not.toMatch(/^\s*\*/m);
    expect(reduzido).toMatch(/\.lane\.a \.tok \{\s*animation-duration: 6s;/);
    expect(reduzido).toMatch(/\.lane\.b \.tok \{[^}]*animation: pulso/);
    expect(reduzido).toMatch(/transition: opacity 0\.3s ease/);
  });
});
