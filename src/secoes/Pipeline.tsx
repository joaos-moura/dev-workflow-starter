import { Secao } from "../componentes/Secao";

const ANTES = [
  "Pedido de repositório ao time de infraestrutura.",
  "Pedido de pipeline ao time de infraestrutura.",
  "Pedido de papel de acesso.",
  "Publicação só em HML.",
  "Espera de dias.",
] as const;

const DEPOIS = [
  "Detecção de tecnologia",
  "Gates de segurança (CodeQL, Dependabot, secret scan, reviewdog)",
  "Testes e cobertura",
  "Build e scan",
  "Preview PR",
  "CD Dev",
  "CD HML",
  "Perf HML",
  "CD PRD",
] as const;

export function Pipeline() {
  return (
    <Secao id="pipeline" titulo="Pipeline">
      <p>
        O caminho vira uma esteira. ECR, Datadog APM e o deploy real de HML e PRD ficam na versão
        empresa.
      </p>
      <div className="comparacao">
        <article className="antes">
          <h3>Antes</h3>
          <ol className="passos">
            {ANTES.map((etapa) => (
              <li key={etapa}>{etapa}</li>
            ))}
          </ol>
        </article>
        <article className="depois">
          <h3>Depois</h3>
          <ol className="passos">
            {DEPOIS.map((etapa) => (
              <li key={etapa}>{etapa}</li>
            ))}
          </ol>
        </article>
      </div>
    </Secao>
  );
}
