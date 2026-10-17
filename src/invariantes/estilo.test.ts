import { describe, expect, it } from "vitest";
import estilos from "../styles.css?raw";
import { validarEstilo, violaAnimacaoUniversal } from "./estilo";

const BUG_12 = `@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}`;

describe("seletor universal não zera movimento", () => {
  it("aceita o styles.css atual", () => {
    expect(() => validarEstilo(estilos)).not.toThrow();
    expect(violaAnimacaoUniversal(estilos)).toEqual([]);
  });

  it("reprova o * { animation:none !important } do #12", () => {
    expect(violaAnimacaoUniversal(BUG_12).join("\n")).toMatch(/\*\s*\{/);
    expect(() => validarEstilo(BUG_12)).toThrow(/seletor universal/);
  });

  it("reprova * { transition: none } sem !important", () => {
    expect(() => validarEstilo("* { transition: none; }")).toThrow(/seletor universal/);
  });

  it("não acusa o * { box-sizing } nem animation:none em seletor específico", () => {
    expect(violaAnimacaoUniversal(" * { box-sizing: border-box; margin: 0; } ")).toEqual([]);
    expect(violaAnimacaoUniversal(".rd .sw { animation: none; }")).toEqual([]);
    expect(violaAnimacaoUniversal(".chave .trilho::after { transition: none; }")).toEqual([]);
  });
});
