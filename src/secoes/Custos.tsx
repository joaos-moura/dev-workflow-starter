import { useId, useState } from "react";
import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";
import { CampoNumero, Cita, Escolha, Interruptor } from "../calculadora/Campos";
import {
  CAPACIDADE_AZURE_ATUAL,
  CENARIO_ATUAL_AZURE,
  ENTRADAS_PADRAO,
  PREMISSAS_PADRAO,
  capacidadeGitHub,
  comparar,
  converter,
  formatarMoeda,
  frasesDeCadeiras,
  normalizar,
  type Entradas,
  type Moeda,
  type PlanoGitHub,
  type Premissas,
  type Resultado,
  type RunnerGitHub,
} from "../calculadora/calculo";
import { CITACOES, FICHAS_PREMISSAS } from "../calculadora/premissas";
import {
  FICHAS,
  FONTES,
  PRECOS_OFICIAIS,
  VERIFICADO_EM,
  origemDoPreco,
  precoEditavel,
  type IdPreco,
  type Precos,
} from "../calculadora/precos";

const RUNNERS: readonly { valor: RunnerGitHub; rotulo: string }[] = [
  { valor: "linux-2", rotulo: "Linux 2-core" },
  { valor: "linux-1", rotulo: "Linux 1-core" },
  { valor: "linux-arm64", rotulo: "Linux arm64 2-core" },
  { valor: "windows-2", rotulo: "Windows 2-core" },
  { valor: "macos", rotulo: "macOS" },
];

const PLANOS: readonly { valor: PlanoGitHub; rotulo: string }[] = [
  { valor: "team", rotulo: "Team" },
  { valor: "enterprise", rotulo: "Enterprise" },
];

const MOEDAS: readonly { valor: Moeda; rotulo: string }[] = [
  { valor: "USD", rotulo: "US$" },
  { valor: "BRL", rotulo: "R$" },
];

type PropriedadesPainel = {
  nome: string;
  classe: "az" | "gh";
  resultado: Resultado;
  moeda: Moeda;
  cambio: number;
};

function Painel({ nome, classe, resultado, moeda, cambio }: PropriedadesPainel) {
  const valor = (usd: number) => formatarMoeda(converter(usd, moeda, cambio), moeda);
  return (
    <article className={`painel ${classe}`} aria-label={nome}>
      <h3>{nome}</h3>
      <p className="total">
        <b data-testid={`mensal-${classe}`}>{valor(resultado.mensalUsd)}</b>
        <small>/mês</small>
      </p>
      <p className="anual">
        <span data-testid={`anual-${classe}`}>{valor(resultado.anualUsd)}</span> por ano ·{" "}
        {valor(resultado.porPessoaUsd)} por pessoa/mês
      </p>
      <p className="cadeiras">
        {frasesDeCadeiras(resultado)}
        {resultado.cadeirasGratis > 0 && ` · ${resultado.cadeirasGratis} grátis`}
      </p>
      <ul className="linhas">
        {resultado.linhas.map((linha) => (
          <li key={linha.rotulo}>
            <span>
              {linha.rotulo}
              <small>{linha.detalhe}</small>
            </span>
            <b>{valor(linha.usd)}</b>
          </li>
        ))}
      </ul>
      {resultado.avisos.length > 0 && (
        <ul className="avisos">
          {resultado.avisos.map((aviso) => (
            <li key={aviso}>{aviso}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function CenarioAtualAzure() {
  return (
    <div className="fixo" role="group" aria-label="Azure DevOps · Cenário atual">
      <h3>
        Azure DevOps · Cenário atual <span className="selo">fixo</span>
      </h3>
      <p className="note">O uso de hoje, a preço oficial. Não há campo para editar.</p>
      <dl>
        <div>
          <dt>Organizações</dt>
          <dd>{CENARIO_ATUAL_AZURE.organizacoes}</dd>
        </div>
        <div>
          <dt>Pessoas (Basic)</dt>
          <dd>{CENARIO_ATUAL_AZURE.pessoas}</dd>
        </div>
        <div>
          <dt>Jobs paralelos</dt>
          <dd>{CENARIO_ATUAL_AZURE.jobsParalelos}</dd>
        </div>
        <div>
          <dt>GHAzDO</dt>
          <dd>não usado</dd>
        </div>
      </dl>

      <h4>O que é grátis e o que é pago</h4>
      <ul className="gratis">
        <li>
          <b>Basic:</b> 5 grátis por org; do 6º usuário em diante, US$ 6/mês.
          <Cita {...CITACOES.basicGratis} />
        </li>
        <li>
          <b>Job Microsoft-hosted:</b> 1 grátis, com limite de 1.800 min/mês e 60 min por execução;
          pago custa US$ 40/mês, sem limite de minutos.
          <Cita {...CITACOES.jobMicrosoftGratis} />
        </li>
        <li>
          <b>Job self-hosted:</b> 1 grátis, sem limite de minutos; extra custa US$ 15/mês.
          <Cita {...CITACOES.jobSelfHostedGratis} />
        </li>
      </ul>
      <p className="note">
        A conta usa o job como Microsoft-hosted grátis, a cota que toda org recebe ao ligar a
        cobrança. Falta confirmar se o job de hoje é esse, um pago (+US$ 40/mês) ou self-hosted.
      </p>

      <h4>Cobrança por org</h4>
      <p className="note">
        O Azure DevOps cobra por organização: cada org tem os próprios 5 Basic grátis e cobra quem
        está nela. Com mais de uma org, existe o multi-org billing, que cobra cada pessoa uma vez
        entre orgs da mesma assinatura Azure. Com uma org só, não muda nada.
      </p>
      <Cita {...CITACOES.porOrg} />
      <Cita {...CITACOES.multiOrg} />
    </div>
  );
}

export function Custos() {
  const [entradas, setEntradas] = useState<Entradas>(ENTRADAS_PADRAO);
  const [premissas, setPremissas] = useState<Premissas>(PREMISSAS_PADRAO);
  const [precos, setPrecos] = useState<Precos>(PRECOS_OFICIAIS);
  const idRunner = useId();

  const mudar =
    <K extends keyof Entradas>(chave: K) =>
    (valor: Entradas[K]) =>
      setEntradas((atual) => ({ ...atual, [chave]: valor }));
  const mudarPessoas = (pessoas: number) =>
    setEntradas((atual) => ({
      ...atual,
      pessoas,
      committersAtivos: atual.committersAtivos === atual.pessoas ? pessoas : atual.committersAtivos,
    }));
  const mudarPremissa = (chave: keyof Premissas) => (ligado: boolean) =>
    setPremissas((atual) => ({ ...atual, [chave]: ligado }));
  const mudarPreco = (id: IdPreco) => (valor: number) =>
    setPrecos((atual) => ({ ...atual, [id]: valor }));

  const normal = normalizar(entradas);
  const { azure, github } = comparar(entradas, premissas, precos);
  const capacidade = capacidadeGitHub(normal.planoGitHub, normal.runnerGitHub);
  const maior = Math.max(azure.mensalUsd, github.mensalUsd, 1);
  const valor = (usd: number) =>
    formatarMoeda(converter(usd, normal.moeda, normal.cambio), normal.moeda);

  return (
    <Secao
      id="custos"
      numero="11"
      rotulo="Custos"
      titulo="Quanto custa cada caminho."
      sub={
        <>
          O Azure DevOps de hoje, fixo, contra o GitHub com Actions, que você configura. Preços
          públicos oficiais, verificados em {VERIFICADO_EM}.
        </>
      }
    >
      <Revelar className="capacidade">
        <article className="cap az" aria-label="Capacidade do Azure DevOps">
          <small>Pipeline · Azure DevOps hoje</small>
          <b>{CAPACIDADE_AZURE_ATUAL.titulo}</b>
          <p>{CAPACIDADE_AZURE_ATUAL.detalhe}</p>
          <Cita {...CITACOES.filaUnica} />
        </article>
        <article className="cap gh" aria-label="Capacidade do GitHub">
          <small>Pipeline · GitHub no plano escolhido</small>
          <b data-testid="capacidade-gh">{capacidade.titulo}</b>
          <p>{capacidade.detalhe}</p>
          <Cita {...CITACOES.minutosGitHub} />
          <Cita {...CITACOES.jobsGitHub} />
        </article>
      </Revelar>

      <Revelar className="calc">
        <div className="calc-form">
          <CenarioAtualAzure />

          <form
            className="calc-campos"
            aria-label="GitHub"
            onSubmit={(evento) => evento.preventDefault()}
          >
            <fieldset>
              <legend>GitHub</legend>
              <CampoNumero
                rotulo="Pessoas (devs)"
                valor={entradas.pessoas}
                aoMudar={mudarPessoas}
                dica="Total de pessoas, o mesmo grupo do Azure DevOps."
              />
              <Escolha
                rotulo="Plano GitHub"
                valor={entradas.planoGitHub}
                opcoes={PLANOS}
                aoMudar={mudar("planoGitHub")}
              />
              <CampoNumero
                rotulo="Minutos de pipeline por mês"
                valor={entradas.minutosMes}
                aoMudar={mudar("minutosMes")}
                passo={100}
                dica="Começa no teto da cota grátis do job de hoje."
              />
              <CampoNumero
                rotulo="% dos minutos em self-hosted"
                valor={entradas.percentualSelfHosted}
                aoMudar={mudar("percentualSelfHosted")}
                max={100}
                passo={10}
              />
              <div className="campo">
                <label htmlFor={idRunner}>Runner hospedado</label>
                <select
                  id={idRunner}
                  value={entradas.runnerGitHub}
                  onChange={(evento) => mudar("runnerGitHub")(evento.target.value as RunnerGitHub)}
                >
                  {RUNNERS.map((runner) => (
                    <option key={runner.valor} value={runner.valor}>
                      {runner.rotulo}
                    </option>
                  ))}
                </select>
              </div>
              {FICHAS_PREMISSAS.map((ficha) => (
                <Interruptor
                  key={ficha.chave}
                  rotulo={ficha.rotulo}
                  ligado={premissas[ficha.chave]}
                  aoMudar={mudarPremissa(ficha.chave)}
                >
                  <small>
                    {ficha.texto}{" "}
                    <a href={ficha.fonte} target="_blank" rel="noreferrer">
                      Fonte
                    </a>
                    {ficha.estimativa && <span className="selo est">estimativa</span>}
                  </small>
                </Interruptor>
              ))}
            </fieldset>

            <fieldset>
              <legend>Segurança no GitHub</legend>
              <Interruptor rotulo="GHAS ligado" ligado={entradas.ghas} aoMudar={mudar("ghas")}>
                <small>A segurança roda no pipeline, cobrada por committer ativo.</small>
              </Interruptor>
              <Interruptor
                rotulo="Code Security"
                ligado={entradas.codeSecurity}
                aoMudar={mudar("codeSecurity")}
                desligado={!entradas.ghas}
              />
              <Interruptor
                rotulo="Secret Protection"
                ligado={entradas.secretProtection}
                aoMudar={mudar("secretProtection")}
                desligado={!entradas.ghas}
              />
              <CampoNumero
                rotulo="Committers ativos (90 dias)"
                valor={entradas.committersAtivos}
                aoMudar={mudar("committersAtivos")}
                max={normal.pessoas}
                desligado={!entradas.ghas}
                dica="Começa igual ao número de pessoas e acompanha esse campo até ser editado."
              />
            </fieldset>

            <fieldset>
              <legend>Moeda</legend>
              <Escolha
                rotulo="Mostrar em"
                valor={entradas.moeda}
                opcoes={MOEDAS}
                aoMudar={mudar("moeda")}
              />
              <CampoNumero
                rotulo="Câmbio (R$ por US$)"
                valor={entradas.cambio}
                aoMudar={mudar("cambio")}
                passo={0.01}
                dica={
                  <>
                    PTAX venda de {VERIFICADO_EM},{" "}
                    <a href={FONTES.ptax} target="_blank" rel="noreferrer">
                      Banco Central
                    </a>
                    .
                  </>
                }
              />
            </fieldset>
          </form>
        </div>

        <div className="calc-res" aria-live="polite">
          <div className="barras" role="img" aria-label="Total mensal de cada caminho">
            <div>
              <span>Azure DevOps</span>
              <i className="az" style={{ width: `${(azure.mensalUsd / maior) * 100}%` }} />
              <b>{valor(azure.mensalUsd)}</b>
            </div>
            <div>
              <span>GitHub</span>
              <i className="gh" style={{ width: `${(github.mensalUsd / maior) * 100}%` }} />
              <b>{valor(github.mensalUsd)}</b>
            </div>
          </div>
          <Painel
            nome="Azure DevOps · Cenário atual"
            classe="az"
            resultado={azure}
            moeda={normal.moeda}
            cambio={normal.cambio}
          />
          <Painel
            nome="GitHub"
            classe="gh"
            resultado={github}
            moeda={normal.moeda}
            cambio={normal.cambio}
          />
        </div>
      </Revelar>

      <Revelar className="tabela">
        <table className="tbl precos">
          <caption>Preços usados · verificados em {VERIFICADO_EM}</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">US$</th>
              <th scope="col">Unidade</th>
              <th scope="col">Origem</th>
            </tr>
          </thead>
          <tbody>
            {FICHAS.map((ficha) => {
              const editavel = precoEditavel(ficha);
              const atual = editavel ? precos[ficha.id] : PRECOS_OFICIAIS[ficha.id];
              const origem = origemDoPreco(ficha.id, atual);
              return (
                <tr key={ficha.id}>
                  <th scope="row">
                    {ficha.item}
                    <small>{ficha.plataforma}</small>
                  </th>
                  <td>
                    {editavel ? (
                      <input
                        type="number"
                        aria-label={`Preço de ${ficha.item}`}
                        min={0}
                        step="any"
                        value={Number.isFinite(atual) ? atual : ""}
                        onChange={(evento) => mudarPreco(ficha.id)(evento.target.valueAsNumber)}
                      />
                    ) : (
                      <span className="fixo-valor">{atual}</span>
                    )}
                  </td>
                  <td>{ficha.unidade}</td>
                  <td>
                    <span className={origem === "oficial" ? "selo ok" : "selo est"}>{origem}</span>
                    {!editavel && <span className="selo">fixo</span>}{" "}
                    <a href={ficha.fonte} target="_blank" rel="noreferrer">
                      {new URL(ficha.fonte).hostname}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Revelar>
      <p className="note">
        Preço do GitHub editado vira estimativa. Fora da conta: Artifacts acima de 2 GiB, storage do
        Actions, plano antigo por minuto e assinaturas Visual Studio.
      </p>
    </Secao>
  );
}
