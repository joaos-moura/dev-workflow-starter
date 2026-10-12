import { Secao } from "../componentes/Secao";

const PASSOS = [
  "O portal ou o template cria o serviço: repositório, pipeline e papel.",
  "O Terraform mostra o plan no pull request. O apply na conta Dev acontece depois da aprovação.",
  "O deploy só acontece pelo GitHub Actions, via OIDC.",
  "O serviço já nasce observável: logs do Actions e o health da API.",
] as const;

export function Caminho() {
  return (
    <Secao id="caminho" titulo="Caminho feliz">
      <ol className="passos">
        {PASSOS.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>
      <p className="lema">Um produto por vez.</p>
    </Secao>
  );
}
