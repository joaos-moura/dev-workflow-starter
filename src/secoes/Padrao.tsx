import { Secao } from "../componentes/Secao";

const CAMADAS = [
  {
    nome: "Cloud",
    texto: "Conta Dev própria, separada de HML e de PRD.",
  },
  {
    nome: "Runtime",
    texto: "Neste starter, S3 e Lambda. Em produção, ECS Fargate.",
  },
  {
    nome: "Git e CI",
    texto: "O GitHub no centro, com Actions em todo pull request.",
  },
  {
    nome: "Segurança",
    texto: "OIDC, sem chave de acesso, com CodeQL e Dependabot.",
  },
  {
    nome: "Observabilidade",
    texto: "Log do Actions e health da API desde o primeiro deploy.",
  },
  {
    nome: "Dados",
    texto: "Postgres no stack alvo, quando o serviço precisar de estado.",
  },
  {
    nome: "Portal",
    texto: "Este template abre o caminho. Backstage entra no radar.",
  },
  {
    nome: "IaC",
    texto: "Terraform, com o plan publicado no pull request.",
  },
  {
    nome: "Trabalho",
    texto: "Devcontainer, Conventional Commits e um produto por vez.",
  },
  {
    nome: "Governança AWS",
    texto: "SSO e papéis por repositório. Sem usuário IAM.",
  },
] as const;

export function Padrao() {
  return (
    <Secao id="padrao" titulo="Padrão 360°">
      <p>O padrão cobre dez camadas. O starter entrega o miolo; o resto tem lugar marcado.</p>
      <ol className="camadas">
        {CAMADAS.map((camada) => (
          <li key={camada.nome}>
            <strong>{camada.nome}</strong>
            <span>{camada.texto}</span>
          </li>
        ))}
      </ol>
    </Secao>
  );
}
