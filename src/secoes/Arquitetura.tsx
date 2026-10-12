import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";

function Seta() {
  return <div className="arrow" aria-hidden="true" />;
}

export function Arquitetura() {
  return (
    <Secao
      id="arquitetura"
      numero="05"
      rotulo="Arquitetura"
      titulo="Backstage → GitHub → OIDC → AWS, sem nenhuma chave guardada."
      sub="O pedido nasce no Backstage, que cria o repositório no GitHub. O Actions assume um papel temporário via OIDC. Na conta Dev, o Terraform sobe o site e a API."
    >
      <Revelar>
        <figure
          className="diagram"
          aria-label="Fluxo do Backstage ao GitHub, GitHub Actions, OIDC e conta AWS Dev com Terraform, S3 e Lambda"
        >
          <div className="node bs">
            <b>Backstage</b>
            <span>porta de entrada do dev</span>
          </div>
          <Seta />
          <div className="node">
            <b>GitHub</b>
            <span>repositório + pull request</span>
          </div>
          <Seta />
          <div className="node">
            <b>GitHub Actions</b>
            <span>lint · teste · plan</span>
          </div>
          <Seta />
          <div className="node k">
            <b>OIDC</b>
            <span>papel temporário, sem chave</span>
          </div>
          <Seta />
          <div className="acct">
            <em>Conta AWS · Dev</em>
            <div className="node">
              <b>Terraform</b>
              <span>state em S3 · use_lockfile</span>
            </div>
            <div className="node">
              <b>S3 + Lambda</b>
              <span>
                site estático · API <code className="i">ok: true</code>
              </span>
            </div>
          </div>
        </figure>
      </Revelar>
      <p className="note">
        S3 e Lambda cabem no free tier. Em produção, o runtime seria ECS Fargate. O GitHub Pages
        publica a mesma interface sem AWS.
      </p>
    </Secao>
  );
}
