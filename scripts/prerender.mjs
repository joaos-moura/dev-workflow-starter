import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "vite";

const marcador = '<div id="root"></div>';
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const modulo = await vite.ssrLoadModule("/src/entry-server.tsx");
  const html = modulo.renderPagina();
  const caminho = "dist/index.html";
  const index = readFileSync(caminho, "utf8");
  if (!index.includes(marcador)) {
    console.error("prerender: #root vazio não encontrado em dist/index.html");
    process.exitCode = 1;
  } else {
    writeFileSync(
      caminho,
      index.replace(marcador, () => `<div id="root">${html}</div>`),
    );
    console.log("prerender ok");
  }
} finally {
  await vite.close();
}
