import { expect, test } from "@playwright/test";

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("o conteúdo aparece e a pipeline continua animando", async ({ page }) => {
    await page.goto("./#pipeline");
    await expect(page.locator("#pipeline h2")).toHaveCSS("opacity", "1");

    const token = page.locator("#pipeline .lane.a .tok");
    await expect(token).toBeVisible();
    const animacao = await token.evaluate((el) => getComputedStyle(el).animationName);
    expect(animacao, "a pipeline não pode zerar animation no reduce").not.toBe("none");
  });
});

test("sem a classe .mov o conteúdo permanece visível", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("h1")).toHaveCSS("opacity", "1");
  await page.evaluate(() => document.documentElement.classList.remove("mov"));
  await expect(
    page.locator("#pipeline h2"),
    "sem .mov o .rv não pode nascer em opacity 0",
  ).toHaveCSS("opacity", "1");
  await expect(page.locator("#usar h2")).toHaveCSS("opacity", "1");
});
