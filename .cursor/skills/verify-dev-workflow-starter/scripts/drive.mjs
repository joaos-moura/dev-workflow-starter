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
  await page.goto(`${url}#custos`);
  const secao = page.locator("#custos");
  await visivel(page, secao, "#custos");
  await visivel(page, secao.getByRole("heading", { level: 2 }), "título de Custos");

  const azure = page.getByRole("article", { name: "Azure DevOps · Cenário atual" });
  await visivel(page, azure.getByTestId("mensal-az"), "total Azure");
  if (!(await azure.getByTestId("mensal-az").innerText()).includes("160,00")) {
    falha("Azure padrão deveria ser US$ 160,00/mês.");
  }

  const github = page.getByRole("article", { name: "GitHub" });
  if (!(await github.getByTestId("mensal-gh").innerText()).includes("80,00")) {
    falha("GitHub padrão deveria ser US$ 80,00/mês, GHAS desligado.");
  }

  const ghas = page.getByRole("switch", { name: /GHAS ligado/ });
  if (await ghas.isChecked()) falha("GHAS precisa nascer desligado.");
  await visivel(page, page.getByTestId("upgrade-ghas"), "upgrade GHAS");
  const upgrade = await page.getByTestId("upgrade-ghas").innerText();
  if (!upgrade.includes("980,00") || !upgrade.includes("Code Security")) {
    falha(`upgrade GHAS inesperado: ${upgrade}`);
  }

  await ghas.click();
  if (!(await github.getByTestId("mensal-gh").innerText()).includes("1.060,00")) {
    falha("Com GHAS, o GitHub Team deveria ir a US$ 1.060,00.");
  }
  await ghas.click();

  await page.getByRole("form", { name: "GitHub" }).getByText("Enterprise", { exact: true }).click();
  const capacidade = await page.getByTestId("capacidade-gh").innerText();
  if (!capacidade.includes("50.000") || !capacidade.includes("500")) {
    falha(`capacidade Enterprise inesperada: ${capacidade}`);
  }
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
  await visivel(page, secao.getByRole("heading", { name: "Antes e depois." }), "título");
  await visivel(page, secao.getByText("Preview PR"), "Preview PR");
  await visivel(page, secao.getByText("CD Dev"), "CD Dev");
  await visivel(page, secao.getByText("CD HML"), "CD HML");
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
const reduced = recurso === "movimento";
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: reduced ? "reduce" : "no-preference",
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
