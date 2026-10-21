#!/usr/bin/env node
/**
 * Falha se a página pública citar custo, preço ou um nome da lista.
 * A página é index.html + o fonte em src (sem testes). Não varre README,
 * workflows nem este script.
 *
 * Padrões (Unicode, sem diferenciar maiúsculas):
 * - custo, custos
 * - quanto custa
 * - preço, preços, preco, precos
 * - US$
 * - R$
 * - $/mês e /mês (mês com ou sem acento)
 * - grátis, gratis
 * - gratuito, gratuita, gratuitos, gratuitas, gratuitamente
 * - empresas, com fronteira de palavra: B3, BTG, Itaú, Itau, XP, VidMob,
 *   Syngenta, Inventa, Loomi, SpaceX
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const RAIZ_PADRAO = join(aqui, "../..");

function fronteira(nucleo) {
  return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${nucleo})(?![\\p{L}\\p{N}_])`, "iu");
}

export const PADROES = [
  { nome: "custo", re: fronteira("custos?") },
  { nome: "quanto custa", re: /quanto\s+custa/iu },
  { nome: "preço", re: fronteira("pre[cç]os?") },
  { nome: "US$", re: fronteira("US\\$") },
  { nome: "R$", re: fronteira("R\\$") },
  { nome: "$/mês", re: /\$\s*(?:\d+(?:[.,]\d+)?)?\s*\/\s*m[eê]s/iu },
  { nome: "/mês", re: /\/\s*m[eê]s/iu },
  { nome: "grátis", re: fronteira("gr[aá]tis(?:es)?") },
  { nome: "gratuito", re: fronteira("gratuit[oa]s?(?:mente)?") },
  { nome: "B3", re: fronteira("B3") },
  { nome: "BTG", re: fronteira("BTG") },
  { nome: "Itaú", re: fronteira("Ita[uú]") },
  { nome: "XP", re: fronteira("XP") },
  { nome: "VidMob", re: fronteira("VidMob") },
  { nome: "Syngenta", re: fronteira("Syngenta") },
  { nome: "Inventa", re: fronteira("Inventa") },
  { nome: "Loomi", re: fronteira("Loomi") },
  { nome: "SpaceX", re: fronteira("SpaceX") },
];

export function verificarTexto(texto, arquivo = "texto") {
  const achados = [];
  const linhas = texto.split(/\r?\n/);
  linhas.forEach((linha, indice) => {
    for (const padrao of PADROES) {
      if (padrao.re.test(linha)) {
        achados.push({
          arquivo,
          linha: indice + 1,
          nome: padrao.nome,
          trecho: linha.trim().slice(0, 160),
        });
      }
    }
  });
  return achados;
}

function listarFonte(diretorio, acumulado) {
  for (const nome of readdirSync(diretorio)) {
    const caminho = join(diretorio, nome);
    if (statSync(caminho).isDirectory()) {
      listarFonte(caminho, acumulado);
      continue;
    }
    if (/\.(tsx|ts)$/.test(nome) && !/\.test\.(tsx|ts)$/.test(nome)) {
      acumulado.push(caminho);
    }
  }
  return acumulado;
}

export function arquivosDaPagina(raiz) {
  return [join(raiz, "index.html"), ...listarFonte(join(raiz, "src"), [])];
}

export function verificarPagina(raiz) {
  return arquivosDaPagina(raiz).flatMap((arquivo) =>
    verificarTexto(readFileSync(arquivo, "utf8"), relative(raiz, arquivo)),
  );
}

function relatar(achados) {
  if (achados.length === 0) {
    console.log("✓ página pública ok");
    return 0;
  }
  console.error(`✗ página pública: ${achados.length} ocorrência(s)`);
  for (const achado of achados) {
    console.error(`${achado.arquivo}:${achado.linha}: [${achado.nome}] ${achado.trecho}`);
  }
  return 1;
}

const ehCli = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (ehCli) {
  const raiz = process.argv[2] ? join(process.cwd(), process.argv[2]) : RAIZ_PADRAO;
  process.exitCode = relatar(verificarPagina(raiz));
}
