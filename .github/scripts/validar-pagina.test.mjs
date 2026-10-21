import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { verificarPagina, verificarTexto } from "./validar-pagina.mjs";

const raizDoRepo = join(dirname(fileURLToPath(import.meta.url)), "../..");

function nomes(texto) {
  return new Set(verificarTexto(texto).map((achado) => achado.nome));
}

describe("validar-pagina", () => {
  it("aceita texto sem preço e sem nome da lista", () => {
    const limpo = [
      "O PR recebe lint, testes e CodeQL em paralelo.",
      "Trivy escaneia a imagem. O preview comenta a URL.",
      "Experiência com export, xpath e Web3 no Terraform.",
      "Feedback em minutos. Todo mês o Dependabot abre outro PR.",
      "pagamentos-api segue no catálogo.",
    ].join("\n");
    assert.deepEqual(verificarTexto(limpo), []);
  });

  it("reprova custo, preço e moeda", () => {
    assert.ok(nomes("o custo do runner").has("custo"));
    assert.ok(nomes("CUSTOS do pool").has("custo"));
    assert.ok(nomes("quanto custa cada caminho").has("quanto custa"));
    assert.ok(nomes("tabela de preço").has("preço"));
    assert.ok(nomes("preços oficiais").has("preço"));
    assert.ok(nomes("preco editavel").has("preço"));
    assert.ok(nomes("total US$ 10").has("US$"));
    assert.ok(nomes("câmbio R$ 5").has("R$"));
    assert.ok(nomes("US$ 6/mês").has("$/mês"));
    assert.ok(nomes("US$ 6/mês").has("/mês"));
    assert.ok(nomes("plano 40/mês").has("/mês"));
    assert.ok(nomes("5 grátis").has("grátis"));
    assert.ok(nomes("template gratuito").has("gratuito"));
    assert.ok(nomes("é gratuita").has("gratuito"));
    assert.ok(nomes("oferecido gratuitamente").has("gratuito"));
  });

  it("reprova cada nome da lista e ignora o miolo da palavra", () => {
    for (const nome of [
      "B3",
      "b3",
      "BTG",
      "Itaú",
      "ITAU",
      "Itau",
      "XP",
      "xp",
      "VidMob",
      "vidmob",
      "Syngenta",
      "Inventa",
      "Loomi",
      "SpaceX",
      "spacex",
    ]) {
      assert.ok(verificarTexto(`contrato com ${nome} hoje`).length > 0, nome);
    }
    assert.deepEqual(verificarTexto("experiência export xpath Web3 EXPRESS custom"), []);
    assert.equal(nomes("o token expira no expo").has("XP"), false);
  });

  it("falha num fixture e passa noutro", () => {
    const pasta = mkdtempSync(join(tmpdir(), "pagina-"));
    mkdirSync(join(pasta, "src"));
    writeFileSync(join(pasta, "index.html"), "<title>limpo</title>\n");
    writeFileSync(join(pasta, "src", "App.tsx"), "export const t = 'pipeline';\n");
    writeFileSync(join(pasta, "src", "App.test.tsx"), "custo US$ XP\n");
    assert.deepEqual(verificarPagina(pasta), []);

    writeFileSync(join(pasta, "src", "App.tsx"), "const aviso = 'quanto custa na B3';\n");
    const achados = verificarPagina(pasta);
    assert.ok(achados.some((achado) => achado.nome === "quanto custa"));
    assert.ok(achados.some((achado) => achado.nome === "B3"));
    assert.ok(achados.every((achado) => achado.arquivo === "src/App.tsx"));
  });

  it("aceita a página deste repositório", () => {
    const achados = verificarPagina(raizDoRepo);
    assert.deepEqual(
      achados,
      [],
      achados.map((achado) => `${achado.arquivo}:${achado.linha} [${achado.nome}]`).join("\n"),
    );
  });
});
