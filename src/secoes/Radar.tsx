import { Secao } from "../componentes/Secao";
import { ITENS_RADAR, agruparRadar, rotuloStatus, type StatusRadar } from "../radar";

const ORDEM: readonly StatusRadar[] = ["adotar", "avaliar", "segurar"];

export function Radar() {
  const grupos = agruparRadar(ITENS_RADAR);

  return (
    <Secao id="radar" titulo="Radar">
      <p>
        O stack alvo entra num radar simples de adotar, avaliar e segurar. Datadog, GitHub
        Enterprise e GitHub Advanced Security aparecem só na versão empresa.
      </p>
      <div className="grade">
        {ORDEM.map((status) => (
          <article className="cartao" key={status}>
            <h3>{rotuloStatus(status)}</h3>
            <ul>
              {grupos[status].map((item) => (
                <li key={item.nome}>{item.nota ? `${item.nome} — ${item.nota}` : item.nome}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Secao>
  );
}
