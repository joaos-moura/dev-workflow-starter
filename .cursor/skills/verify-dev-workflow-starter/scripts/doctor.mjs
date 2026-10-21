#!/usr/bin/env node
import { chromium } from "playwright";
import { URL as URL_PADRAO, urlDoPreview } from "./lib.mjs";

const url = process.argv[2] ?? urlDoPreview() ?? URL_PADRAO;

function falha(mensagem) {
  console.error(`doctor: ${mensagem}`);
  process.exit(1);
}

const html = await fetch(url).then((resposta) => {
  if (!resposta.ok) falha(`${url} → HTTP ${resposta.status}`);
  return resposta.text();
});
if (!html.includes("dev-workflow-starter")) {
  falha("o HTML não tem o título do SPA; o preview não está servindo o site.");
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });

const nav = page.getByRole("navigation", { name: "Seções" });
if (!(await nav.isVisible())) falha("nav Seções ausente.");

const h1 = page.getByRole("heading", { level: 1 });
if (!(await h1.isVisible())) falha("h1 ausente.");
const opacidade = await h1.evaluate((el) => getComputedStyle(el).opacity);
if (opacidade !== "1") falha(`h1 com opacity ${opacidade}; conteúdo precisa nascer visível.`);

for (const id of ["desafio", "pipeline", "pr", "ghas", "promocao", "usar"]) {
  const secao = page.locator(`#${id}`);
  if ((await secao.count()) !== 1) falha(`seção #${id} ausente.`);
}

const secoes = await page.locator("main > section").count();
if (secoes !== 14) falha(`esperava 14 seções, achei ${secoes}.`);

await browser.close();
console.log(`doctor ok: ${url} · 14 seções · h1 visível · nav Seções`);
