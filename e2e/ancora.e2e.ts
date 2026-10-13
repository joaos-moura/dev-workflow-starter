import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __rolagens: number[];
  }
}

async function ancorasDoMenu(page: Page) {
  await page.goto("./");
  const ancoras = await page
    .locator("nav .links a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(ancoras).toEqual(expect.arrayContaining(["#custos", "#usar"]));
  return [...new Set([...ancoras, "#futuro"])];
}

async function distanciaDaBarra(page: Page, hash: string) {
  return page.evaluate((seletor) => {
    const secao = document.querySelector(seletor);
    const barra = document.querySelector("nav");
    if (!secao || !barra) return Number.POSITIVE_INFINITY;
    return Math.abs(secao.getBoundingClientRect().top - barra.getBoundingClientRect().bottom);
  }, hash);
}

for (const movimento of ["no-preference", "reduce"] as const) {
  test.describe(`primeira carga com âncora (${movimento})`, () => {
    test.use({ reducedMotion: movimento });

    test("abre cada seção do menu logo abaixo da barra, com o conteúdo visível", async ({
      page,
    }) => {
      const ancoras = await ancorasDoMenu(page);
      await page.addInitScript(() => {
        window.__rolagens = [];
        addEventListener("scroll", () => window.__rolagens.push(scrollY), { passive: true });
      });
      for (const hash of ancoras) {
        await page.goto(`./?carga=${Date.now()}${hash}`);

        await expect.poll(() => distanciaDaBarra(page, hash), { message: hash }).toBeLessThan(2);
        await expect(page.locator(`${hash} h2`)).toHaveCSS("opacity", "1");

        if (movimento === "reduce") {
          const rolagens = await page.evaluate(() => window.__rolagens);
          const final = await page.evaluate(() => scrollY);
          const intermediarias = rolagens.filter((y) => y < final * 0.9);
          expect(intermediarias, `${hash} rolou animado com reduce`).toEqual([]);
        }
      }
    });
  });
}
