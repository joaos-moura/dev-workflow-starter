import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const script = join(aqui, "validar-workflows.mjs");
const raiz = join(aqui, "../..");

function rodar(dir) {
  return spawnSync("node", [script, dir], { encoding: "utf8", cwd: raiz });
}

describe("validar-workflows", () => {
  it("aceita o .github atual", () => {
    const r = rodar(".");
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /workflows ok/);
  });

  it("reprova concurrency no topo com jobs HML/PRD, o #15", () => {
    const pasta = join(raiz, "node_modules/.cache/validar-workflows/bug-15");
    mkdirSync(join(pasta, ".github/workflows"), { recursive: true });
    writeFileSync(
      join(pasta, ".github/workflows/pipeline.yml"),
      `name: Pipeline
concurrency:
  group: pipeline-\${{ github.ref }}
  cancel-in-progress: \${{ github.event_name == 'pull_request' }}
jobs:
  cd_hml:
    environment: hml
    runs-on: ubuntu-latest
    steps: [{ run: echo }]
  perf_hml:
    environment: hml
    runs-on: ubuntu-latest
    steps: [{ run: echo }]
  cd_prd:
    environment: prd
    runs-on: ubuntu-latest
    steps: [{ run: echo }]
`,
    );
    const r = rodar(pasta);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /concurrency' no topo do workflow/);
    assert.match(r.stderr, /cd_hml, perf_hml, cd_prd/);
    assert.match(r.stderr, /cancel-in-progress: false em HML\/PRD/);
  });

  it("reprova composite action que lê vars, o #2", () => {
    const pasta = join(raiz, "node_modules/.cache/validar-workflows/bug-2");
    mkdirSync(join(pasta, ".github/actions/porta-aws"), { recursive: true });
    mkdirSync(join(pasta, ".github/workflows"), { recursive: true });
    writeFileSync(join(pasta, ".github/workflows/ci.yml"), "name: CI\njobs: {}\n");
    writeFileSync(
      join(pasta, ".github/actions/porta-aws/action.yml"),
      `name: Porta
runs:
  using: composite
  steps:
    - shell: bash
      run: echo "\${{ vars.AWS_ROLE_ARN }}"
`,
    );
    const r = rodar(pasta);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /composite action lê 'vars\.'/);
    assert.match(r.stderr, /Unrecognized named-value/);
    assert.match(r.stderr, /declare um input/);
  });
});
