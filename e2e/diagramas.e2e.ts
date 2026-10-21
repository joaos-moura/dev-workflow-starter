import { expect, test } from "@playwright/test";

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("os diagramas ficam no estado final e a trilha continua animando", async ({ page }) => {
    await page.goto("./#pipeline");

    const erroAntigo = page.locator("#pipeline .lane.b .stop.x");
    await expect(erroAntigo).toHaveCSS("color", "rgb(217, 72, 15)");
    await expect(page.locator("#pipeline .lane.a .stop.cedo")).toHaveCSS(
      "color",
      "rgb(14, 159, 110)",
    );

    await expect(page.locator("#pr .st.on")).toHaveCount(5);
    await expect(page.locator("#pr .st.on").first()).toHaveCSS(
      "background-color",
      "rgb(232, 247, 241)",
    );
    await expect(page.locator("#ghas .ponto")).toHaveCount(5);
    for (const ponto of await page.locator("#ghas .ponto").all()) {
      await expect(ponto).toHaveCSS("opacity", "1");
    }

    const fluxo = page.locator("[data-diagrama='promocao']");
    await expect(fluxo).toHaveAttribute("data-estado", "final");
    await expect(fluxo).toHaveCSS("--p", "1");
    for (const etapa of await page.locator("#promocao .etapa").all()) {
      await expect(etapa).toHaveCSS("opacity", "1");
    }

    const animacao = await page
      .locator("#pipeline .lane.a .tok")
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animacao).not.toBe("none");
  });
});

test.describe("sem javascript", () => {
  test.use({ javaScriptEnabled: false });

  test("o HTML já nasce completo", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("h1")).toHaveText("Do pedido ao ambiente, em minutos");
    await expect(page.locator("html")).not.toHaveClass(/mov/);
    await expect(page.locator("#pr .st.on")).toHaveCount(5);
    await expect(page.locator("#ghas .ponto")).toHaveCount(5);
    await expect(page.locator("[data-diagrama='promocao']")).toHaveAttribute(
      "data-estado",
      "final",
    );
    await expect(page.locator("#pipeline .lane.a .stop.cedo")).toHaveText("PR");
    await expect(page.locator("#promocao .etapa").first()).toHaveCSS("opacity", "1");
  });
});

test("a página e os diagramas cabem na largura", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "só na largura de 390");
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  const medida = await page.evaluate(() => {
    const largura = document.documentElement.clientWidth;
    const fora = [...document.querySelectorAll("[data-diagrama], [data-diagrama] *")]
      .filter((el) => {
        const caixa = el.getBoundingClientRect();
        if (caixa.width === 0 && caixa.height === 0) return false;
        return caixa.left < -1 || caixa.right > largura + 1;
      })
      .slice(0, 6)
      .map((el) => `${el.tagName}.${(el as HTMLElement).className}`);
    return { largura, scroll: document.documentElement.scrollWidth, fora };
  });
  expect(medida.scroll).toBeLessThanOrEqual(medida.largura);
  expect(medida.fora).toEqual([]);
});
