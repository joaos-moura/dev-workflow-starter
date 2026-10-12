import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";

const ANTES = [
  "Só existe HML.",
  "A conta Dev não existe.",
  "Cada passo espera o time de infraestrutura.",
  "A governança de acesso à AWS trava o serviço.",
] as const;

const DEPOIS = [
  "O template entrega o padrão.",
  "O devcontainer prepara o local em minutos.",
  "O PR recebe CI, plan e preview.",
  "O merge aplica o dev, via papel OIDC, sem chave pessoal.",
] as const;

type Etapa = { nome: string; detalhe?: string; nova?: boolean };

const ESTEIRA_ANTES: readonly Etapa[] = [
  { nome: "Detecção" },
  { nome: "Gates 1–4" },
  { nome: "Testes e cobertura" },
  { nome: "CI Build, scan e push ECR" },
  { nome: "CD HML" },
  { nome: "Perf HML (Datadog APM)" },
  { nome: "CD PRD" },
];

const ESTEIRA_DEPOIS: readonly Etapa[] = [
  { nome: "Detecção de tecnologia" },
  { nome: "Gates de segurança", detalhe: "CodeQL, Dependabot, secret scan, reviewdog" },
  { nome: "Testes e cobertura" },
  { nome: "Build e scan" },
  { nome: "Preview PR", nova: true },
  { nome: "CD Dev", nova: true },
  { nome: "CD HML" },
  { nome: "Perf HML" },
  { nome: "CD PRD" },
];

function Etapas({ etapas }: { etapas: readonly Etapa[] }) {
  return (
    <ol className="etapas">
      {etapas.map((etapa) => (
        <li key={etapa.nome}>
          {etapa.nome}
          {etapa.detalhe && <span>{etapa.detalhe}</span>}
          {etapa.nova && <em>novo</em>}
        </li>
      ))}
    </ol>
  );
}

export function Pipeline() {
  return (
    <Secao id="pipeline" numero="08" rotulo="Pipeline" titulo="Antes e depois." alt>
      <Revelar className="lane b">
        <small>Antes · trava em HML</small>
        <div className="track">
          <div className="tok" aria-hidden="true" />
          <div className="stop">
            <i />
            Código
          </div>
          <div className="stop x">
            <i />
            HML · fila
          </div>
          <div className="stop dim">
            <i />
            Acesso AWS
          </div>
          <div className="stop dim">
            <i />
            Deploy
          </div>
        </div>
      </Revelar>
      <Revelar className="lane a">
        <small>Depois · flui</small>
        <div className="track">
          <div className="tok" aria-hidden="true" />
          <div className="stop">
            <i />
            PR
          </div>
          <div className="stop">
            <i />
            CI + plan
          </div>
          <div className="stop">
            <i />
            Preview
          </div>
          <div className="stop">
            <i />
            Merge → Dev
          </div>
        </div>
      </Revelar>
      <Revelar className="cmp">
        <div className="col b">
          <h3>Antes</h3>
          <ul>
            {ANTES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className="time">⏱ dias</span>
        </div>
        <div className="col a">
          <h3>Depois</h3>
          <ul>
            {DEPOIS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className="time">⏱ minutos</span>
        </div>
      </Revelar>
      <Revelar className="esteira">
        <div className="col b">
          <h3>Esteira antes</h3>
          <Etapas etapas={ESTEIRA_ANTES} />
        </div>
        <div className="col a">
          <h3>Esteira depois</h3>
          <Etapas etapas={ESTEIRA_DEPOIS} />
        </div>
      </Revelar>
      <p className="note">
        Push para o ECR, Datadog APM e o deploy real de HML e PRD ficam na versão empresa; aqui são
        simulados.
      </p>
    </Secao>
  );
}
