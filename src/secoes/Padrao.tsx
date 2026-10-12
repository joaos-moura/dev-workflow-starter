import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";

const CAMADAS = [
  { nome: "Cloud", texto: "Conta Dev própria, separada de HML e de PRD." },
  { nome: "Runtime", texto: "Neste starter, S3 e Lambda. Em produção, ECS Fargate." },
  { nome: "Git e CI", texto: "GitHub no centro, Actions em todo PR." },
  { nome: "Segurança", texto: "OIDC sem chave, CodeQL e Dependabot." },
  { nome: "Observabilidade", texto: "Log do Actions e health da API desde o 1º deploy." },
  { nome: "Dados", texto: "Postgres no stack alvo, quando houver estado." },
  { nome: "Portal", texto: "O template abre o caminho; Backstage entra." },
  { nome: "IaC", texto: "Terraform, com o plan publicado no PR." },
  { nome: "Trabalho", texto: "Devcontainer, Conventional Commits, um produto por vez." },
  { nome: "Governança", texto: "AWS SSO e papéis por repositório. Sem usuário IAM." },
] as const;

const PRINCIPIOS = [
  {
    titulo: "Autonomia",
    texto: "Conta Dev própria; publica sem pedir acesso a cada serviço.",
  },
  {
    titulo: "Qualidade no dia a dia",
    texto: "CI honesto e observabilidade já no template.",
  },
  {
    titulo: "Integração",
    texto: "O GitHub é o hub: código, pipeline, preview e promoção.",
  },
  {
    titulo: "IA com guardrails",
    texto: "CI, review e CODEOWNERS decidem o que chega na main.",
  },
] as const;

export function Padrao() {
  return (
    <Secao
      id="padrao"
      numero="04"
      rotulo="Padrão 360°"
      titulo="Dez camadas. O starter entrega o miolo."
      sub="O resto tem lugar marcado."
      alt
    >
      <Revelar>
        <ol className="layers">
          {CAMADAS.map((camada, indice) => (
            <li className="ly" key={camada.nome}>
              <i>{String(indice + 1).padStart(2, "0")}</i>
              <b>{camada.nome}</b>
              <p>{camada.texto}</p>
            </li>
          ))}
        </ol>
      </Revelar>
      <Revelar className="grid g4">
        {PRINCIPIOS.map((principio) => (
          <article className="card" key={principio.titulo}>
            <h3>{principio.titulo}</h3>
            <p>{principio.texto}</p>
          </article>
        ))}
      </Revelar>
    </Secao>
  );
}
