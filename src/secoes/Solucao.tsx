import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";

const PECAS = [
  {
    sigla: "T",
    titulo: "Template",
    texto: "O padrão do time pronto para virar um repositório novo.",
  },
  {
    sigla: "PR",
    titulo: "Preview por pull request",
    texto: "Workspace isolado, destruído quando o PR fecha.",
  },
  { sigla: "D", titulo: "Ambiente dev fixo", texto: "Aplicado a cada merge na main." },
  { sigla: "{}", titulo: "Devcontainer", texto: "O ambiente local repetido em minutos." },
  {
    sigla: "CI",
    titulo: "CI honesto + qualidade",
    texto: "Lint, teste e build; CodeQL, Dependabot e ESLint no PR.",
  },
  {
    sigla: "ID",
    titulo: "Deploy via OIDC",
    texto: "Só pelo GitHub Actions, sem chave de acesso.",
  },
] as const;

export function Solucao() {
  return (
    <Secao
      id="solucao"
      numero="02"
      rotulo="A solução"
      titulo="Sete peças do mesmo fluxo."
      sub="O starter entrega o miolo do padrão. Cada peça funciona sozinha e todas passam pelo GitHub."
      alt
    >
      <Revelar className="grid g3">
        {PECAS.map((peca) => (
          <article className="card" key={peca.titulo}>
            <div className="ic" aria-hidden="true">
              {peca.sigla}
            </div>
            <h3>{peca.titulo}</h3>
            <p>{peca.texto}</p>
          </article>
        ))}
      </Revelar>
    </Secao>
  );
}
