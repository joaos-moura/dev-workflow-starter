import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const script = join(aqui, "validar-movimento.mjs");
const raiz = join(aqui, "../..");

function rodar(arquivo) {
  return spawnSync("node", [script, arquivo], { encoding: "utf8", cwd: raiz });
}

describe("validar-movimento", () => {
  it("aceita src/styles.css atual", () => {
    const r = rodar("src/styles.css");
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /movimento ok/);
  });

  it("reprova o seletor universal e o .rv sem .mov do #12", () => {
    const pasta = join(raiz, "node_modules/.cache/validar-movimento");
    mkdirSync(pasta, { recursive: true });
    const arquivo = join(pasta, "bug-12.css");
    writeFileSync(
      arquivo,
      `.rv { opacity: 0; transform: translateY(16px); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
}
`,
    );
    const r = rodar(arquivo);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /desliga todo o movimento/);
    assert.match(r.stderr, /começa invisível sem a guarda '\.mov'/);
    assert.match(r.stderr, /troque deslocamento por fade curto/);
    assert.match(r.stderr, /ativarMovimento/);
  });
});
