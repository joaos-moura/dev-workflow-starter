import { expect, test, type Page } from "@playwright/test";

const COR_ERRO = "rgb(217, 72, 15)";
const COR_OK = "rgb(14, 159, 110)";

async function esperarEstadoFinal(page: Page) {
  await page.locator("#pipeline .lane.a").evaluate(async (trilho) => {
    const finitas = trilho.getAnimations({ subtree: true }).filter((animacao) => {
      return animacao.effect?.getComputedTiming().iterations !== Infinity;
    });
    await Promise.all(finitas.map((animacao) => animacao.finished));
  });
}

async function depoisNoEstadoFinal(page: Page) {
  await page.goto("./#pipeline");
  await esperarEstadoFinal(page);

  const nos = page.locator("#pipeline .lane.a .stop");
  await expect(nos).toHaveCount(4);
  for (const no of await nos.all()) {
    const estado = await no.getAttribute("data-estado");
    expect.soft(estado === "ok" || estado === "corrigido", "estado do nó").toBe(true);
    await expect.soft(no).not.toHaveClass(/\bx\b/);
    const cores = await no.evaluate((el) => {
      const marca = el.querySelector("i");
      const estiloMarca = marca ? getComputedStyle(marca) : null;
      return {
        color: getComputedStyle(el).color,
        borda: estiloMarca?.borderTopColor ?? "",
        fundo: estiloMarca?.backgroundColor ?? "",
      };
    });
    expect.soft(cores.color, "cor do texto").not.toBe(COR_ERRO);
    expect.soft(cores.borda, "cor da borda").not.toBe(COR_ERRO);
    expect.soft(cores.fundo, "cor do fundo").not.toBe(COR_ERRO);
    expect.soft(cores.borda, "nó verde").toBe(COR_OK);
  }

  await expect
    .soft(page.locator("#pipeline .lane.a .stop.cedo"))
    .toHaveAttribute("data-estado", "corrigido");
  await expect
    .soft(page.locator("#pipeline .lane.a .stop.cedo"))
    .toHaveAccessibleName("erro pego e corrigido");

  const sobras = await page.locator("#pipeline .lane.a .track").evaluate((trilho) => {
    const visivel = (el: Element) => {
      const estilo = getComputedStyle(el);
      if (estilo.display === "none" || estilo.visibility === "hidden") return false;
      if (Number.parseFloat(estilo.opacity) === 0) return false;
      const caixa = el.getBoundingClientRect();
      return caixa.width > 1 && caixa.height > 1;
    };
    const achados: string[] = [];
    for (const filho of trilho.children) {
      if (!visivel(filho)) continue;
      if (filho.classList.contains("stop")) continue;
      achados.push(`filho ${filho.tagName}.${filho.className}`);
    }
    for (const el of trilho.querySelectorAll("*")) {
      if (!visivel(el)) continue;
      const no = el.classList.contains("stop") ? el : el.closest(".stop");
      if (!no) {
        achados.push(`solto ${el.tagName}.${el.className}`);
        continue;
      }
      const caixaNo = no.getBoundingClientRect();
      const caixa = el.getBoundingClientRect();
      const dentro =
        caixa.left >= caixaNo.left - 1 &&
        caixa.right <= caixaNo.right + 1 &&
        caixa.top >= caixaNo.top - 1 &&
        caixa.bottom <= caixaNo.bottom + 1;
      if (!dentro) achados.push(`fora ${el.tagName}.${el.className}`);
    }
    return achados;
  });
  expect.soft(sobras, "decoração fora de um nó").toEqual([]);
}

test.describe("depois no estado final, com javascript", () => {
  test("nenhum nó está em erro e nada decorativo fica fora de um nó", async ({ page }) => {
    await depoisNoEstadoFinal(page);
  });
});

test.describe("depois no estado final, com movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("nenhum nó está em erro e nada decorativo fica fora de um nó", async ({ page }) => {
    await depoisNoEstadoFinal(page);
  });
});

test.describe("depois no estado final, sem javascript", () => {
  test.use({ javaScriptEnabled: false });

  test("nenhum nó está em erro e nada decorativo fica fora de um nó", async ({ page }) => {
    await depoisNoEstadoFinal(page);
  });
});
