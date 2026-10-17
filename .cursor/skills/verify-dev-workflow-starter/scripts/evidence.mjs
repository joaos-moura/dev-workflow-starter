#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { pastaEvidencia, urlDoPreview } from "./lib.mjs";

const url = urlDoPreview();
const destino = pastaEvidencia();
const artefatos = process.env.ARTIFACTS ?? "/opt/cursor/artifacts/screenshots";

const browser = await chromium.launch();

async function captura(nome, { largura, reduced, hash, seletor }) {
  const page = await browser.newPage({
    viewport: { width: largura, height: largura === 390 ? 844 : 900 },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await page.goto(`${url}${hash ?? ""}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const passo = 360;
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  const arquivo = join(destino, nome);
  if (seletor) {
    await page.locator(seletor).screenshot({ path: arquivo });
  } else {
    await page.screenshot({ path: arquivo, fullPage: true });
  }
  if (existsSync(artefatos)) {
    mkdirSync(artefatos, { recursive: true });
    copyFileSync(arquivo, join(artefatos, nome));
  }
  await page.close();
  console.log(arquivo);
}

await captura("custos-1440.png", {
  largura: 1440,
  reduced: false,
  hash: "#custos",
  seletor: "#custos",
});
await captura("custos-390.png", {
  largura: 390,
  reduced: false,
  hash: "#custos",
  seletor: "#custos",
});
await captura("ancora-custos-1440.png", {
  largura: 1440,
  reduced: true,
  hash: "#custos",
});
await captura("pipeline-reduce-1440.png", {
  largura: 1440,
  reduced: true,
  hash: "#pipeline",
  seletor: "#pipeline",
});

await browser.close();
console.log(`evidence ok em ${destino} (sobrevive ao cleanup).`);
