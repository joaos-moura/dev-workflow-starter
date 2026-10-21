#!/usr/bin/env node
import { chromium } from "playwright";
import { urlDoPreview } from "./lib.mjs";

const url = urlDoPreview();
const recurso = process.argv[2] ?? "custos";

function falha(mensagem) {
  throw new Error(mensagem);
}

async function visivel(page, locator, rotulo) {
  if (!(await locator.isVisible())) falha(`${rotulo} não está visível.`);
}

async function custos(page) {
  await page.goto(`${url}#pr`);
  if ((await page.locator("#custos").count()) !== 0)
    falha("a seção de custos ainda está na página.");
  const secao = page.locator("#pr");
  await visivel(page, secao, "#pr");
  await visivel(page, secao.getByText("Ilustração"), "ilustração");
  await visivel(page, secao.getByText("Lint"), "lint");
  await visivel(page, secao.getByText("reviewdog"), "comentário");
}

async function ancoras(page) {
  await page.goto(url);
  const nav = page.getByRole("navigation", { name: "Seções" });
  const hrefs = await nav
    .locator(".links a")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  for (const hash of hrefs) {
    if (!hash?.startsWith("#")) continue;
    await page.goto(`${url}${hash}`);
    const secao = page.locator(hash);
    await visivel(page, secao.locator("h2"), `${hash} h2`);
    const distancia = await page.evaluate((seletor) => {
      const alvo = document.querySelector(seletor);
      const barra = document.querySelector("nav");
      if (!alvo || !barra) return Number.POSITIVE_INFINITY;
      return Math.abs(alvo.getBoundingClientRect().top - barra.getBoundingClientRect().bottom);
    }, hash);
    if (distancia >= 2) falha(`${hash} não ficou sob a barra (Δ=${distancia}).`);
  }
}

async function movimento(page) {
  await page.goto(`${url}#pipeline`);
  const h2 = page.locator("#pipeline h2");
  await visivel(page, h2, "título da pipeline");
  const opacidade = await h2.evaluate((el) => getComputedStyle(el).opacity);
  if (opacidade !== "1") falha(`pipeline h2 opacity ${opacidade}`);
  const animacao = await page
    .locator("#pipeline .lane.a .tok")
    .evaluate((el) => getComputedStyle(el).animationName);
  if (animacao === "none") falha("token da pipeline com animation:none no reduce.");
}

async function pipeline(page) {
  await page.goto(`${url}#pipeline`);
  const secao = page.getByRole("region", { name: "Pipeline" });
  await visivel(page, secao.getByRole("heading", { name: "O erro muda de lugar." }), "título");
  await visivel(page, secao.getByText("Erro só em HML · dias"), "antes");
  await visivel(page, secao.getByText("Erro no PR · minutos"), "depois");
}

async function usar(page) {
  await page.goto(`${url}#usar`);
  const secao = page.getByRole("region", { name: "Como usar" });
  const passos = secao.locator("ol > li");
  if ((await passos.count()) !== 6) falha("Como usar deveria ter 6 passos.");
  await visivel(page, secao.getByText("AWS_ROLE_ARN"), "variável AWS");
}

const acoes = { custos, ancoras, movimento, pipeline, usar };

const acao = acoes[recurso];
if (!acao) {
  console.error(`recurso desconhecido: ${recurso}. Use: ${Object.keys(acoes).join(", ")}`);
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
try {
  await acao(page);
  console.log(`drive ok: ${recurso}`);
} catch (erro) {
  console.error(`drive falhou (${recurso}):`, erro instanceof Error ? erro.message : erro);
  process.exitCode = 1;
} finally {
  await browser.close();
}
