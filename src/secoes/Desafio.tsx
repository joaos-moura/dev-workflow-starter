import { Secao } from "../componentes/Secao";

export function Desafio() {
  return (
    <Secao id="desafio" titulo="O desafio">
      <p>
        Numa empresa de médio porte, o time só tem HML (homologação). A conta Dev não existe. Cada
        serviço novo depende do time de infraestrutura em todo passo: repositório, pipeline, papel
        de acesso e lugar para publicar.
      </p>
      <p>
        O maior bloqueio é a governança de acesso à AWS. O pedido entra na fila e a espera dura
        dias.
      </p>
    </Secao>
  );
}
