import { Secao } from "../componentes/Secao";

const PECAS = [
  "Template com o padrão do time, pronto para virar um repositório novo.",
  "Ambiente por pull request, num workspace isolado, destruído quando o PR fecha.",
  "Ambiente dev fixo, aplicado a cada merge na main.",
  "Devcontainer para repetir o ambiente local em minutos.",
  "CI honesto: lint, teste e build em todo pull request.",
  "Qualidade no repositório: CodeQL, Dependabot e comentários de ESLint.",
  "Deploy só pelo GitHub Actions, via OIDC, sem chave de acesso.",
] as const;

export function Solucao() {
  return (
    <Secao id="solucao" titulo="A solução">
      <p>O atalho gratuito cabe em sete peças. Nada disso pede serviço pago.</p>
      <ul className="lista">
        {PECAS.map((peca) => (
          <li key={peca}>{peca}</li>
        ))}
      </ul>
    </Secao>
  );
}
