import { useEffect, useLayoutEffect, type RefObject } from "react";

/**
 * No servidor não há layout. No cliente, o efeito de layout liga a animação
 * antes da pintura, para o HTML estático continuar sendo o estado final.
 */
const useLayoutNoCliente = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * 0 quando o topo do diagrama encosta na base da janela.
 * 1 quando a base do diagrama encosta na base da janela,
 * para o último estágio acender ainda dentro da tela.
 */
export function progressoDaRolagem(
  top: number,
  alturaJanela: number,
  alturaElemento: number,
): number {
  const distancia = alturaElemento > 0 ? alturaElemento : alturaJanela;
  if (distancia <= 0) return 1;
  return Math.min(1, Math.max(0, (alturaJanela - top) / distancia));
}

/**
 * O listener de scroll só levanta a bandeira. A leitura de layout fica no
 * requestAnimationFrame. Sem um frame já agendado, o scroll pede um.
 */
export function ligarRolagem(
  elemento: HTMLElement,
  aoMedir: (progresso: number) => void,
): () => void {
  if (typeof window.requestAnimationFrame !== "function") return () => {};

  let pendente = false;
  let agendado = false;
  let quadroId = 0;

  const medir = () => {
    if (!pendente) return;
    pendente = false;
    const rect = elemento.getBoundingClientRect();
    aoMedir(progressoDaRolagem(rect.top, window.innerHeight || 1, rect.height));
  };

  const quadro = () => {
    agendado = false;
    medir();
  };

  const pedirQuadro = () => {
    if (agendado) return;
    agendado = true;
    quadroId = window.requestAnimationFrame(quadro);
  };

  const aoRolar = () => {
    pendente = true;
    pedirQuadro();
  };

  window.addEventListener("scroll", aoRolar, { passive: true });
  pendente = true;
  pedirQuadro();

  return () => {
    window.cancelAnimationFrame(quadroId);
    window.removeEventListener("scroll", aoRolar);
  };
}

export function ligarTrilho(elemento: HTMLElement, reduzido: boolean): () => void {
  if (reduzido || typeof window.requestAnimationFrame !== "function") {
    elemento.dataset.estado = "final";
    elemento.style.setProperty("--p", "1");
    return () => {};
  }

  elemento.dataset.estado = "animando";
  elemento.style.setProperty("--p", "0");
  return ligarRolagem(elemento, (progresso) => {
    elemento.style.setProperty("--p", progresso.toFixed(3));
  });
}

export function useTrilho(ref: RefObject<HTMLElement | null>): void {
  useLayoutNoCliente(() => {
    const elemento = ref.current;
    if (!elemento) return;
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    return ligarTrilho(elemento, reduzido);
  }, [ref]);
}
