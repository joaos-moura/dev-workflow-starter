import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";
import { ITENS_RADAR, agruparRadar, rotuloStatus, type StatusRadar } from "../radar";

const ORDEM: readonly StatusRadar[] = ["adotar", "avaliar", "segurar"];

const ATRASO_ENTRE_BLIPS_MS = 110;

// Posições do protótipo aprovado, na ordem de ITENS_RADAR (em % do círculo).
const POSICOES = [
  [58.6, 50.0],
  [47.6, 58.3],
  [42.7, 45.3],
  [56.5, 44.3],
  [53.6, 57.9],
  [28.6, 53.0],
  [59.6, 30.6],
  [60.6, 68.8],
  [28.5, 48.1],
  [73.8, 21.1],
  [41.1, 86.4],
  [42.3, 13.4],
] as const;

function classeDoBlip(status: StatusRadar): string {
  switch (status) {
    case "adotar":
      return "bl a";
    case "avaliar":
      return "bl v";
    case "segurar":
      return "bl s";
    default: {
      const nunca: never = status;
      return nunca;
    }
  }
}

export function Radar() {
  const grupos = agruparRadar(ITENS_RADAR);

  return (
    <Secao
      id="radar"
      numero="12"
      rotulo="Radar"
      titulo="Adotar, avaliar, segurar."
      sub="Datadog, GitHub Enterprise e GitHub Advanced Security só aparecem na versão empresa."
    >
      <Revelar className="radar">
        <div
          className="rd"
          role="img"
          aria-label="Radar com três anéis: adotar no centro, avaliar no meio e segurar na borda"
        >
          <div className="sw" />
          <span className="ln" style={{ top: "44%" }}>
            adotar
          </span>
          <span className="ln" style={{ top: "23%" }}>
            avaliar
          </span>
          <span className="ln" style={{ top: "6%" }}>
            segurar
          </span>
          {ITENS_RADAR.map((item, indice) => {
            const [left, top] = POSICOES[indice] ?? [50, 50];
            return (
              <i
                key={item.nome}
                className={classeDoBlip(item.status)}
                title={item.nome}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transitionDelay: `${indice * ATRASO_ENTRE_BLIPS_MS}ms`,
                }}
              />
            );
          })}
        </div>
        <div className="rlist">
          {ORDEM.map((status) => (
            <div key={status}>
              <h3 className={status}>{rotuloStatus(status)}</h3>
              <ul>
                {grupos[status].map((item) => (
                  <li key={item.nome}>
                    {item.nome}
                    {item.nota && <em>{item.nota}</em>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Revelar>
    </Secao>
  );
}
