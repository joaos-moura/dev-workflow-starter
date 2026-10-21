import { afterEach, describe, expect, it, vi } from "vitest";
import { ligarRolagem, ligarTrilho, progressoDaRolagem } from "./rolagem";

describe("progresso da rolagem", () => {
  it("vai de 0 a 1 enquanto o diagrama atravessa a janela", () => {
    expect(progressoDaRolagem(800, 800, 600)).toBe(0);
    expect(progressoDaRolagem(200, 800, 600)).toBe(1);
    expect(progressoDaRolagem(500, 800, 600)).toBeCloseTo(0.5);
    expect(progressoDaRolagem(2000, 800, 600)).toBe(0);
    expect(progressoDaRolagem(-40, 800, 600)).toBe(1);
    expect(progressoDaRolagem(800, 800, 0)).toBe(0);
  });
});

describe("ligarRolagem", () => {
  const fila: FrameRequestCallback[] = [];

  afterEach(() => {
    fila.length = 0;
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  function instalarQuadro() {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      fila.push(cb);
      return fila.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  }

  it("não mede layout no listener de scroll", () => {
    instalarQuadro();
    const elemento = document.createElement("div");
    document.body.append(elemento);
    const medidas: number[] = [];
    const spy = vi.spyOn(elemento, "getBoundingClientRect").mockReturnValue({
      top: 800,
      height: 200,
      bottom: 1000,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: 800,
      toJSON() {
        return {};
      },
    });
    const escuta = vi.spyOn(window, "addEventListener");

    const parar = ligarRolagem(elemento, (progresso) => medidas.push(progresso));

    expect(escuta).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
    expect(spy).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("scroll"));
    expect(spy).not.toHaveBeenCalled();
    expect(medidas).toEqual([]);

    const quadro = fila.shift();
    if (!quadro) throw new Error("frame ausente");
    quadro(0);
    expect(spy).toHaveBeenCalledOnce();
    expect(medidas).toEqual([0]);
    parar();
  });
});

describe("ligarTrilho", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("com movimento reduzido permanece no estado final", () => {
    const elemento = document.createElement("div");
    elemento.dataset.estado = "final";
    const parar = ligarTrilho(elemento, true);
    expect(elemento.dataset.estado).toBe("final");
    expect(elemento.style.getPropertyValue("--p")).toBe("1");
    parar();
  });
});
