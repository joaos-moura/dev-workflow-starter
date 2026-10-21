import type { CSSProperties } from "react";
import { Icone, type NomeIcone } from "../componentes/Icone";
import { Secao } from "../componentes/Secao";

const PONTOS: readonly {
  icone: NomeIcone;
  tom: "alerta" | "acento" | "ok";
  quando: string;
  titulo: string;
  nota: string;
  extra: string;
}[] = [
  {
    icone: "bloqueio",
    tom: "alerta",
    quando: "Push",
    titulo: "Push protection",
    nota: "Barra o push com segredo",
    extra: "Contorno gera alerta",
  },
  {
    icone: "diff",
    tom: "acento",
    quando: "Push e PR",
    titulo: "CodeQL",
    nota: "Anota a linha nova no diff",
    extra: "Check: Code scanning results",
  },
  {
    icone: "pacote",
    tom: "acento",
    quando: "PR",
    titulo: "Dependency review",
    nota: "Vulnerabilidade nova falha o check",
    extra: "Licença: só se a action negar",
  },
  {
    icone: "cadeado",
    tom: "alerta",
    quando: "Proteção do ramo",
    titulo: "Merge travado",
    nota: "Check obrigatório ou ruleset",
    extra: "Code scanning: limiar de severidade",
  },
  {
    icone: "arquivo",
    tom: "ok",
    quando: "Depois do merge",
    titulo: "Security and quality",
    nota: "Alertas ficam no repositório",
    extra: "Overview é da organização",
  },
];

function atraso(indice: number): CSSProperties {
  return { "--i": indice } as CSSProperties;
}

export function Ghas() {
  return (
    <Secao id="ghas" numero="10" rotulo="GHAS" titulo="Do commit ao merge.">
      <div
        data-diagrama="ghas"
        data-sequencia=""
        role="group"
        aria-label="Do commit ao merge"
        aria-describedby="ghas-legenda"
      >
        <ol className="linha-tempo">
          {PONTOS.map((ponto, indice) => (
            <li key={ponto.titulo} className="ponto" data-passo="" style={atraso(indice)}>
              <span className={`marca ${ponto.tom}`}>
                <Icone nome={ponto.icone} />
              </span>
              <div>
                <small>{ponto.quando}</small>
                <b>{ponto.titulo}</b>
                <span>{ponto.nota}</span>
                <span>{ponto.extra}</span>
              </div>
            </li>
          ))}
        </ol>
        <p id="ghas-legenda">
          Ilustração. Dependabot alerta no ramo padrão, pelo grafo e pelo advisory. Não é um check
          do PR. Secret scanning alerta se o commit entrar.
        </p>
      </div>
    </Secao>
  );
}
