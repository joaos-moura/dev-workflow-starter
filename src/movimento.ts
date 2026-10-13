import { useEffect, useState, type RefObject } from "react";

/** Classe no <html> que libera os estados escondidos do CSS. Sem ela, tudo fica visível. */
export const CLASSE_MOVIMENTO = "mov";

/** Se o IntersectionObserver não responder nesse prazo, o conteúdo aparece mesmo assim. */
export const PRAZO_DO_OBSERVADOR_MS = 1500;

export function temObservador(): boolean {
  return typeof IntersectionObserver !== "undefined";
}

/**
 * Melhoria progressiva: só esconde conteúdo para animar quando o JS rodou e há
 * IntersectionObserver. O prefers-reduced-motion não desliga nada aqui; o CSS
 * troca o movimento por fades curtos.
 */
export function ativarMovimento(raiz: HTMLElement = document.documentElement): boolean {
  if (!temObservador()) return false;
  raiz.classList.add(CLASSE_MOVIMENTO);
  return true;
}

/**
 * Agenda o fallback só com a aba visível: numa aba em segundo plano o observador
 * fica parado de propósito, e o prazo começa a contar quando ela volta.
 */
export function vigiar(acao: () => void, prazo = PRAZO_DO_OBSERVADOR_MS): () => void {
  let relogio: number | undefined;
  const iniciar = () => {
    if (relogio !== undefined || document.visibilityState === "hidden") return;
    relogio = window.setTimeout(acao, prazo);
  };
  document.addEventListener("visibilitychange", iniciar);
  iniciar();
  return () => {
    document.removeEventListener("visibilitychange", iniciar);
    window.clearTimeout(relogio);
  };
}

/**
 * Observa o elemento. O observador sempre entrega uma primeira leitura logo após o
 * observe(); se ela não chegar no prazo, `falhou` vira true.
 */
export function observar(
  elemento: Element,
  limiar: number,
  aoMudar: (visivel: boolean) => void,
  aoFalhar: () => void,
): () => void {
  let respondeu = false;
  const pararVigia = vigiar(() => {
    if (!respondeu) aoFalhar();
  });
  const observador = new IntersectionObserver(
    ([entrada]) => {
      respondeu = true;
      pararVigia();
      aoMudar(entrada?.isIntersecting ?? false);
    },
    { threshold: limiar },
  );
  observador.observe(elemento);
  return () => {
    pararVigia();
    observador.disconnect();
  };
}

/** Sem IntersectionObserver, a página mostra direto o estado final. */
export function useSemObservador(): boolean {
  return !temObservador();
}

/** Vira true na primeira vez que o elemento cruza o limiar (ou se o observador falhar). */
export function useRevelado(ref: RefObject<Element | null>, limiar = 0.15): boolean {
  const semObservador = useSemObservador();
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (semObservador || visto || !elemento) return;
    const revelar = () => setVisto(true);
    return observar(
      elemento,
      limiar,
      (visivel) => {
        if (visivel) revelar();
      },
      revelar,
    );
  }, [ref, limiar, semObservador, visto]);

  return semObservador || visto;
}
