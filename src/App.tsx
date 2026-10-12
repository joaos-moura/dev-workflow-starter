import { AntesDepois } from "./secoes/AntesDepois";
import { Arquitetura } from "./secoes/Arquitetura";
import { Caminho } from "./secoes/Caminho";
import { ComoUsar } from "./secoes/ComoUsar";
import { Contas } from "./secoes/Contas";
import { Desafio } from "./secoes/Desafio";
import { Objetivos } from "./secoes/Objetivos";
import { Padrao } from "./secoes/Padrao";
import { Pipeline } from "./secoes/Pipeline";
import { Radar } from "./secoes/Radar";
import { Solucao } from "./secoes/Solucao";

const SECOES = [
  ["#desafio", "Desafio"],
  ["#solucao", "Solução"],
  ["#padrao", "Padrão"],
  ["#objetivos", "Objetivos"],
  ["#arquitetura", "Arquitetura"],
  ["#contas", "Contas"],
  ["#caminho", "Caminho feliz"],
  ["#radar", "Radar"],
  ["#antes-depois", "Antes e depois"],
  ["#pipeline", "Pipeline"],
  ["#como-usar", "Como usar"],
] as const;

export function App() {
  return (
    <div className="pagina">
      <a className="pular" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className="topo">
        <p className="marca">dev-workflow-starter</p>
        <h1>Do pedido ao ambiente, em minutos</h1>
        <p className="resumo">
          Um template gratuito para o time sair da fila da infraestrutura: preview por pull request,
          ambiente dev fixo e o mesmo ambiente local no devcontainer.
        </p>
        <nav aria-label="Seções">
          <ul>
            {SECOES.map(([href, rotulo]) => (
              <li key={href}>
                <a href={href}>{rotulo}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="conteudo">
        <Desafio />
        <Solucao />
        <Padrao />
        <Objetivos />
        <Arquitetura />
        <Contas />
        <Caminho />
        <Radar />
        <AntesDepois />
        <Pipeline />
        <ComoUsar />
      </main>
      <footer className="rodape">
        <p>Nada é criado na AWS enquanto a variável AWS_ROLE_ARN não existir.</p>
      </footer>
    </div>
  );
}
