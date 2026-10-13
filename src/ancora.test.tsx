import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { alvoDoHash, comportamentoDaRolagem, rolarParaHashInicial } from "./ancora";
import { App } from "./App";
import estilos from "./styles.css?raw";

type Fontes = { ready: Promise<unknown>; liberar: () => void };

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

function simularFontes(): Fontes {
  let liberar = () => {};
  const ready = new Promise<unknown>((resolver) => {
    liberar = () => resolver(undefined);
  });
  Object.defineProperty(document, "fonts", { value: { ready }, configurable: true });
  return { ready, liberar };
}

const rolagemOriginal = Element.prototype.scrollIntoView;
const rolagens: { id: string; opcoes: ScrollIntoViewOptions | boolean | undefined }[] = [];

beforeEach(() => {
  rolagens.length = 0;
  Element.prototype.scrollIntoView = function (this: Element, opcoes) {
    rolagens.push({ id: this.id, opcoes });
  };
  simularPreferencia(false);
});

afterEach(() => {
  Element.prototype.scrollIntoView = rolagemOriginal;
  window.history.replaceState(null, "", "/");
  Reflect.deleteProperty(document, "fonts");
  vi.unstubAllGlobals();
});

describe("âncora na primeira carga", () => {
  it("rola até a seção do hash depois que o React monta a página", () => {
    window.history.replaceState(null, "", "/#futuro");
    render(<App />);
    expect(rolagens.at(-1)).toEqual({
      id: "futuro",
      opcoes: { behavior: "smooth", block: "start" },
    });
  });

  it("rola na hora, sem animação, com prefers-reduced-motion", () => {
    simularPreferencia(true);
    window.history.replaceState(null, "", "/#radar");
    render(<App />);
    expect(rolagens.at(-1)).toEqual({
      id: "radar",
      opcoes: { behavior: "instant", block: "start" },
    });
  });

  it("não rola sem hash nem com hash que não existe", () => {
    render(<App />);
    window.history.replaceState(null, "", "/#nao-existe");
    render(<App />);
    expect(rolagens).toEqual([]);
  });

  it("realinha quando as fontes terminam de carregar", async () => {
    const fontes = simularFontes();
    render(<section id="usar" />);
    window.history.replaceState(null, "", "/#usar");
    rolarParaHashInicial();
    expect(rolagens).toHaveLength(1);
    await act(async () => {
      fontes.liberar();
      await fontes.ready;
    });
    expect(rolagens).toHaveLength(2);
    expect(rolagens[1]?.id).toBe("usar");
  });

  it("não puxa a página de volta se a pessoa já rolou", async () => {
    const fontes = simularFontes();
    render(<section id="pipeline" />);
    window.history.replaceState(null, "", "/#pipeline");
    rolarParaHashInicial();
    window.dispatchEvent(new Event("wheel"));
    await act(async () => {
      fontes.liberar();
      await fontes.ready;
    });
    expect(rolagens).toHaveLength(1);
  });

  it("deixa a seção visível por padrão e para logo abaixo da barra fixa", () => {
    expect(estilos).toMatch(/--altura-nav: 61px;/);
    expect(estilos).toMatch(/section \{[^}]*scroll-margin-top: var\(--altura-nav\);/);
    expect(estilos).toMatch(/nav \.wrap \{[^}]*height: calc\(var\(--altura-nav\) - 1px\);/);
    expect(estilos).not.toMatch(/animation:\s*none\s*!important/);
  });
});

describe("alvo e comportamento", () => {
  it("decodifica o hash e tolera % solto", () => {
    document.body.innerHTML = '<div id="hoje x futuro"></div><div id="50%"></div>';
    expect(alvoDoHash("#hoje%20x%20futuro")?.id).toBe("hoje x futuro");
    expect(alvoDoHash("#50%")?.id).toBe("50%");
    expect(alvoDoHash("#")).toBeNull();
    expect(alvoDoHash("")).toBeNull();
    document.body.innerHTML = "";
  });

  it("usa smooth sem preferência e instant com reduce", () => {
    expect(comportamentoDaRolagem()).toBe("smooth");
    simularPreferencia(true);
    expect(comportamentoDaRolagem()).toBe("instant");
  });
});
