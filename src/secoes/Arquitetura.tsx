import { Secao } from "../componentes/Secao";
import { Fluxo } from "../diagramas/Fluxo";

export function Arquitetura() {
  return (
    <Secao id="arquitetura" titulo="Arquitetura">
      <p>
        O fluxo parte do GitHub, passa pelo Actions e assume um papel via OIDC. Na conta Dev, o
        Terraform sobe um bucket S3 com o site e uma Lambda com a API. O GitHub Pages publica a
        mesma interface sem usar a AWS.
      </p>
      <Fluxo />
      <p>
        S3 e Lambda ficam neste starter por custo: cabem no free tier. A API responde{" "}
        <code>ok: true</code>. Em produção o runtime seria ECS Fargate.
      </p>
    </Secao>
  );
}
