import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const PORTA = 4173;
export const BASE = "/dev-workflow-starter/";
export const URL = `http://127.0.0.1:${PORTA}${BASE}`;

export function raizDoRepo() {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (dir !== "/") {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "playwright.config.ts"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  throw new Error("raiz do repositório não encontrada");
}

export function pastaRun() {
  const pasta = join(raizDoRepo(), ".cursor/skills/verify-dev-workflow-starter/.run");
  mkdirSync(pasta, { recursive: true });
  return pasta;
}

export function pastaEvidencia() {
  const pasta = join(raizDoRepo(), ".cursor/skills/verify-dev-workflow-starter/evidence");
  mkdirSync(pasta, { recursive: true });
  return pasta;
}

export function urlDoPreview() {
  const arquivo = join(pastaRun(), "url");
  if (existsSync(arquivo)) return readFileSync(arquivo, "utf8").trim();
  return URL;
}

export function gravarUrl(url = URL) {
  writeFileSync(join(pastaRun(), "url"), `${url}\n`);
}
