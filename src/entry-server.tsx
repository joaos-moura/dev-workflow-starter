import { renderToString } from "react-dom/server";
import { App } from "./App";

export function renderPagina(): string {
  return renderToString(<App />);
}
