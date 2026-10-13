const EVENTOS_DO_USUARIO = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

export function alvoDoHash(hash: string, documento: Document = document): HTMLElement | null {
  if (hash.length < 2) return null;
  const bruto = hash.slice(1);
  let id = bruto;
  try {
    id = decodeURIComponent(bruto);
  } catch {
    // Hash com % solto: procura o id do jeito que veio.
  }
  return documento.getElementById(id);
}

export function comportamentoDaRolagem(janela: Window = window): ScrollBehavior {
  return janela.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
}

/**
 * O navegador tenta rolar até o hash uma vez só, quando o HTML termina de carregar. Nessa hora
 * o React ainda não montou as seções, a tentativa falha e a página fica no topo. Esta função
 * refaz a rolagem depois do render e realinha quando as fontes carregam (o texto muda de
 * altura), a menos que a pessoa já tenha rolado por conta própria. Devolve a limpeza.
 */
export function rolarParaHashInicial(janela: Window = window): () => void {
  const alvo = alvoDoHash(janela.location.hash, janela.document);
  if (!alvo) return () => {};

  let ativo = true;
  const parar = () => {
    ativo = false;
    for (const evento of EVENTOS_DO_USUARIO) janela.removeEventListener(evento, parar);
  };
  const rolar = () => {
    if (ativo) alvo.scrollIntoView({ behavior: comportamentoDaRolagem(janela), block: "start" });
  };

  rolar();
  const fontes = janela.document.fonts;
  if (!fontes) {
    parar();
    return parar;
  }
  for (const evento of EVENTOS_DO_USUARIO) {
    janela.addEventListener(evento, parar, { passive: true });
  }
  fontes.ready.then(() => {
    rolar();
    parar();
  });
  return parar;
}
