import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";

const PASSOS = [
  "O portal ou o template cria o serviço: repositório, pipeline e papel.",
  "O Terraform mostra o plan no PR; o apply na conta Dev vem após a aprovação.",
  "O deploy só acontece pelo GitHub Actions, via OIDC.",
  "O serviço nasce observável: logs do Actions e health da API.",
] as const;

export function Caminho() {
  return (
    <Secao id="caminho" numero="07" rotulo="Caminho feliz" titulo="Um produto por vez.">
      <Revelar>
        <ol className="happy">
          {PASSOS.map((passo) => (
            <li className="hp" key={passo}>
              <p>{passo}</p>
            </li>
          ))}
        </ol>
      </Revelar>
    </Secao>
  );
}
