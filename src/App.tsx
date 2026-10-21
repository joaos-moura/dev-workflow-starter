import { useEffect } from "react";
import { rolarParaHashInicial } from "./ancora";
import { Arquitetura } from "./secoes/Arquitetura";
import { Caminho } from "./secoes/Caminho";
import { ComoUsar } from "./secoes/ComoUsar";
import { Contas } from "./secoes/Contas";
import { Desafio } from "./secoes/Desafio";
import { Futuro } from "./secoes/Futuro";
import { Ghas } from "./secoes/Ghas";
import { Padrao } from "./secoes/Padrao";
import { Pipeline } from "./secoes/Pipeline";
import { Portal } from "./secoes/Portal";
import { PrAberto } from "./secoes/PrAberto";
import { Promocao } from "./secoes/Promocao";
import { Radar } from "./secoes/Radar";
import { Solucao } from "./secoes/Solucao";

const LINKS = [
  ["#desafio", "Desafio"],
  ["#solucao", "Solução"],
  ["#portal", "Portal"],
  ["#pipeline", "Pipeline"],
  ["#pr", "No PR"],
  ["#ghas", "GHAS"],
  ["#promocao", "Promoção"],
  ["#usar", "Como usar"],
] as const;

export function App() {
  useEffect(() => rolarParaHashInicial(), []);

  return (
    <>
      <a className="pular" href="#conteudo">
        Ir para o conteúdo
      </a>
      <nav aria-label="Seções">
        <div className="wrap">
          <a className="logo" href="#topo">
            <i aria-hidden="true" />
            dev-workflow-starter
          </a>
          <ul className="links">
            {LINKS.map(([href, rotulo]) => (
              <li key={href}>
                <a href={href}>{rotulo}</a>
              </li>
            ))}
          </ul>
          <a className="btn sm" href="#usar">
            Usar template →
          </a>
        </div>
      </nav>
      <header id="topo">
        <div className="wrap">
          <span className="pill">Padrão de plataforma · open source</span>
          <h1>Do pedido ao ambiente, em minutos</h1>
          <p className="lead">
            Um template para o time sair da fila da infraestrutura: preview por pull request,
            ambiente dev fixo e o mesmo ambiente local no devcontainer.
          </p>
          <div className="cta">
            <a className="btn p" href="#usar">
              Começar agora
            </a>
            <a className="btn" href="#arquitetura">
              Ver arquitetura
            </a>
          </div>
        </div>
      </header>
      <main id="conteudo">
        <Desafio />
        <Solucao />
        <Portal />
        <Padrao />
        <Arquitetura />
        <Contas />
        <Caminho />
        <Pipeline />
        <PrAberto />
        <Ghas />
        <Promocao />
        <Radar />
        <Futuro />
        <ComoUsar />
      </main>
      <footer>
        <div className="wrap">
          <span>dev-workflow-starter · padrão de plataforma de engenharia</span>
          <span>Template · MIT</span>
        </div>
      </footer>
    </>
  );
}
