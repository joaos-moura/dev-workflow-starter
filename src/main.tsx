import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ativarMovimento } from "./movimento";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Elemento #root ausente.");
}

ativarMovimento();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
