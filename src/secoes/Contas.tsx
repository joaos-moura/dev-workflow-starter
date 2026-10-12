import { Secao } from "../componentes/Secao";
import { ContasDiagrama } from "../diagramas/ContasDiagrama";

const CONTAS = ["Dev", "HML", "PRD", "Shared, opcional"] as const;

export function Contas() {
  return (
    <Secao id="contas" titulo="Contas por ambiente">
      <p>
        O acesso é por SSO, sem usuários IAM e sem chaves de acesso pessoais. Cada ambiente mora na
        própria conta. Shared é opcional, para o que for de fato comum.
      </p>
      <ContasDiagrama />
      <ul className="lista">
        {CONTAS.map((conta) => (
          <li key={conta}>{conta}</li>
        ))}
      </ul>
    </Secao>
  );
}
