import { useEffect, useRef, useState } from "react";
import { Secao } from "../componentes/Secao";
import { useRevelado, useSemObservador } from "../movimento";

const PASSO_DO_CONTADOR_MS = 180;

function Contador({ valor, ativo }: { valor: number; ativo: boolean }) {
  const semObservador = useSemObservador();
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (semObservador || !ativo || valor === 0) return;
    let n = 0;
    const relogio = setInterval(() => {
      n += 1;
      setAtual(n);
      if (n >= valor) clearInterval(relogio);
    }, PASSO_DO_CONTADOR_MS);
    return () => clearInterval(relogio);
  }, [ativo, semObservador, valor]);

  // Antes da contagem começar, o número já aparece com o valor final.
  const contando = ativo && !semObservador;
  return <span>{contando ? atual : valor}</span>;
}

export function Desafio() {
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useRevelado(ref);

  return (
    <Secao
      id="desafio"
      numero="01"
      rotulo="O desafio"
      titulo="Um time sem ambiente de dev espera dias por cada serviço."
      sub="Numa empresa de médio porte, só existe homologação (HML). Cada serviço novo depende do time de infraestrutura em todo passo — repositório, pipeline, papel de acesso e lugar para publicar."
    >
      <div ref={ref} className={visivel ? "grid g3 rv vis" : "grid g3 rv"}>
        <div className="card">
          <div className="stat">
            <Contador valor={0} ativo={visivel} />
            <small>contas Dev disponíveis</small>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <Contador valor={4} ativo={visivel} />
            <small>pedidos de acesso por serviço</small>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            dias<small>de espera na fila de governança</small>
          </div>
        </div>
      </div>
      <p className="note">Números ilustrativos.</p>
    </Secao>
  );
}
