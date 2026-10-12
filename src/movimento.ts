import { useEffect, useState, type RefObject } from "react";

const MENOS_MOVIMENTO = "(prefers-reduced-motion: reduce)";

// Sem IntersectionObserver (jsdom, navegadores antigos) não há como saber quando
// animar; a página mostra direto o estado final, como no prefers-reduced-motion.
function semAnimacaoAgora(): boolean {
  if (typeof IntersectionObserver === "undefined") return true;
  return typeof window.matchMedia === "function" && window.matchMedia(MENOS_MOVIMENTO).matches;
}

export function useSemAnimacao(): boolean {
  const [sem, setSem] = useState(semAnimacaoAgora);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const consulta = window.matchMedia(MENOS_MOVIMENTO);
    const mudar = () => setSem(semAnimacaoAgora());
    consulta.addEventListener("change", mudar);
    return () => consulta.removeEventListener("change", mudar);
  }, []);

  return sem;
}

/** Vira true na primeira vez que o elemento cruza o limiar e não volta mais. */
export function useRevelado(ref: RefObject<Element | null>, limiar = 0.15): boolean {
  const semAnimacao = useSemAnimacao();
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (semAnimacao || visto || !elemento) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setVisto(true);
          observador.disconnect();
        }
      },
      { threshold: limiar },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [ref, limiar, semAnimacao, visto]);

  return semAnimacao || visto;
}
