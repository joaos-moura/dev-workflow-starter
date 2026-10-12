import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

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
    expect(grade).toHaveTextContent("0pedidos de acesso");

    entrarNaTela(grade);
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
    expect(campos[0]).toHaveTextContent(/^$/);

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

  it("mostra tudo no estado final, sem observar a rolagem", () => {
    render(<App />);
    expect(observados).toHaveLength(0);
    for (const elemento of document.querySelectorAll(".rv")) {
      expect(elemento).toHaveClass("vis");
    }

    const portal = regiao("O portal");
    const textos = [...portal.querySelectorAll(".in")].map((campo) => campo.textContent);
    expect(textos).toEqual(["pagamentos-api", "API · Node", "checkout"]);
    expect(portal.querySelectorAll(".st.on")).toHaveLength(5);
    expect(portal.querySelector(".done")).toHaveClass("on");
    expect(regiao("O desafio")).toHaveTextContent("4pedidos de acesso");
  });
});
