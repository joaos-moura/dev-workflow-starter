import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";

const ATRASO_ENTRE_LINHAS_MS = 60;

type Linha = { camada: string; hoje: string; futuro: string; muda: boolean };

const LINHAS: readonly Linha[] = [
  { camada: "Cloud", hoje: "AWS", futuro: "AWS (igual)", muda: false },
  {
    camada: "Runtime",
    hoje: "S3 + Lambda",
    futuro: "ECS Fargate; EKS só em avaliação",
    muda: true,
  },
  { camada: "Git/CI", hoje: "GitHub + Actions", futuro: "GitHub + Actions", muda: true },
  {
    camada: "Segurança",
    hoje: "OIDC, CodeQL e Dependabot",
    futuro: "GHAS (Code Security + Secret Protection) e Sonar no PR",
    muda: true,
  },
  {
    camada: "Observabilidade",
    hoje: "Log do Actions + health da API",
    futuro: "Datadog + acesso AWS com governança",
    muda: true,
  },
  { camada: "Backend", hoje: "Node", futuro: ".NET e Node", muda: true },
  { camada: "Frontend", hoje: "React", futuro: "React/Next", muda: true },
  { camada: "Dados", hoje: "Varia por time", futuro: "Postgres + Redis", muda: true },
  {
    camada: "Mensageria",
    hoje: "Varia por time",
    futuro: "SNS/SQS; Kafka em avaliação",
    muda: true,
  },
  {
    camada: "Portal",
    hoje: "Template + workflow novo-projeto",
    futuro: "Backstage como golden path",
    muda: true,
  },
  { camada: "IaC", hoje: "Terraform, plan no PR", futuro: "Terraform padrão", muda: true },
  { camada: "Trabalho", hoje: "Jira", futuro: "Jira (igual)", muda: false },
  {
    camada: "Acesso/Governança",
    hoje: "AWS SSO, papéis por repositório",
    futuro: "SSO, perfis Dev e guardrails",
    muda: true,
  },
];

export function Futuro() {
  return (
    <Secao
      id="futuro"
      numero="10"
      rotulo="Hoje x Futuro"
      titulo="Do starter ao padrão."
      sub={
        <>
          Camadas com <b className="asterisco">*</b> mudam no padrão alvo; Cloud e Trabalho seguem
          iguais.
        </>
      }
      alt
    >
      <Revelar className="tabela">
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col">Camada</th>
              <th scope="col">Hoje (starter)</th>
              <th scope="col">Futuro (padrão)</th>
            </tr>
          </thead>
          <tbody>
            {LINHAS.map((linha, indice) => (
              <tr
                key={linha.camada}
                className={linha.muda ? "star" : undefined}
                style={{ transitionDelay: `${indice * ATRASO_ENTRE_LINHAS_MS}ms` }}
              >
                <th scope="row">
                  {linha.camada}
                  {linha.muda && <span className="sr"> (muda no padrão alvo)</span>}
                </th>
                <td>{linha.hoje}</td>
                <td>{linha.futuro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Revelar>
    </Secao>
  );
}
