const UNIVERSAL = /^\*(::(?:before|after))?$/;

export type RegraCss = { seletores: string[]; corpo: string };

/** Quebra um CSS em regras simples. Ignora @keyframes; mantém o resto, inclusive @media. */
export function regrasDoCss(css: string): RegraCss[] {
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

function zeraMovimento(corpo: string) {
  return /animation\s*:\s*none/i.test(corpo) || /transition\s*:\s*none/i.test(corpo);
}

/**
 * O #12 era `*, *::before, *::after { animation: none !important; transition: none !important }`.
 * Qualquer seletor universal que zere animação ou transição volta a esconder a pipeline.
 */
export function violaAnimacaoUniversal(css: string): string[] {
  const violacoes: string[] = [];
  for (const { seletores, corpo } of regrasDoCss(css)) {
    if (!zeraMovimento(corpo)) continue;
    for (const seletor of seletores) {
      if (UNIVERSAL.test(seletor)) {
        violacoes.push(`${seletor} { ${corpo.trim().replace(/\s+/g, " ")} }`);
      }
    }
  }
  return violacoes;
}

export function validarEstilo(css: string) {
  const violacoes = violaAnimacaoUniversal(css);
  if (violacoes.length > 0) {
    throw new Error(
      `seletor universal com animation:none ou transition:none:\n${violacoes.join("\n")}`,
    );
  }
}
