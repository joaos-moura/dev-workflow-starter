#!/usr/bin/env node
/**
 * Lint de CSS para movimento (nasceu do #11 → #12).
 * Uso: node validar-movimento.mjs [arquivo.css ...]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import postcss from "postcss";

const PADRAO = ["src/styles.css"];

export function verificarMovimento(css, arquivo) {
  const erros = [];
  const raiz = postcss.parse(css, { from: arquivo });

  // M1: `* { animation: none !important }` dentro de prefers-reduced-motion.
  // Desliga TODA animação (no Windows o "Mostrar animações" desligado liga reduce)
  // e quebra estados que dependem de transitionend/animationend.
  raiz.walkAtRules("media", (media) => {
    if (!/prefers-reduced-motion:\s*reduce/.test(media.params)) return;
    media.walkRules((regra) => {
      if (!regra.selectors.some((s) => /(^|[\s>+~,])\*(::?[a-z-]+)?$/.test(s.trim()))) return;
      regra.walkDecls(/^(animation|transition)(-duration)?$/, (decl) => {
        if (/none|^0s?$/.test(decl.value) || decl.important) {
          const importante = decl.important ? " !important" : "";
          const seletor = regra.selector.replace(/\s+/g, " ");
          erros.push(
            `${arquivo}:${decl.source.start.line}: '${seletor} { ${decl.prop}: ${decl.value}${importante} }' ` +
              `em prefers-reduced-motion desliga todo o movimento. Correção: troque deslocamento por fade curto ` +
              `nos seletores que se movem (ver o bloco de reduced-motion em src/styles.css desde o #12).`,
          );
        }
      });
    });
  });

  // M2: conteúdo escondido por padrão. `opacity: 0` numa classe de revelação sem a
  // guarda `.mov` (classe que o JS liga) deixa a página em branco se o observador falhar.
  raiz.walkRules((regra) => {
    if (regra.parent?.type === "atrule" && /keyframes/.test(regra.parent.name)) return;
    const revelacao = regra.selectors.filter((s) => /\.(rv|reveal)\b|\[data-animate\]/.test(s));
    if (!revelacao.length || revelacao.every((s) => /\.mov\b/.test(s))) return;
    regra.walkDecls("opacity", (decl) => {
      if (decl.value.trim() === "0") {
        erros.push(
          `${arquivo}:${decl.source.start.line}: '${regra.selector.replace(/\s+/g, " ")}' começa invisível sem a guarda '.mov'. ` +
            `Correção: escreva '.mov ${revelacao[0]}:not(.vis) { opacity: 0 }' e ligue '.mov' via ativarMovimento() (src/movimento.ts).`,
        );
      }
    });
  });

  return erros;
}

export function validarArquivos(arquivos) {
  const erros = arquivos.flatMap((arquivo) =>
    verificarMovimento(readFileSync(arquivo, "utf8"), arquivo),
  );
  if (erros.length) {
    console.error(erros.map((e) => `✗ ${e}`).join("\n"));
    process.exitCode = 1;
    return erros;
  }
  console.log("✓ movimento ok");
  return [];
}

const ehCli =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (ehCli) {
  const arquivos = process.argv.slice(2);
  validarArquivos(arquivos.length > 0 ? arquivos : PADRAO);
}
