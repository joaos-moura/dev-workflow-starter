import { useId, useState } from "react";
import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";
import { CampoNumero, Escolha, Interruptor } from "../calculadora/Campos";
import {
  ENTRADAS_PADRAO,
  PREMISSAS_PADRAO,
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
import { FICHAS_PREMISSAS } from "../calculadora/premissas";
import {
  FICHAS,
  FONTES,
  PRECOS_OFICIAIS,
  VERIFICADO_EM,
  origemDoPreco,
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
        {resultado.cadeirasDuplicadas > 0 && (
          <em>
            {" "}
            · +{new Intl.NumberFormat("pt-BR").format(resultado.cadeirasDuplicadas)} por acesso
            cruzado
          </em>
        )}
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

export function Custos() {
  const [entradas, setEntradas] = useState<Entradas>(ENTRADAS_PADRAO);
  const [premissas, setPremissas] = useState<Premissas>(PREMISSAS_PADRAO);
  const [precos, setPrecos] = useState<Precos>(PRECOS_OFICIAIS);
  const idRunner = useId();

  const mudar =
    <K extends keyof Entradas>(chave: K) =>
    (valor: Entradas[K]) =>
      setEntradas((atual) => ({ ...atual, [chave]: valor }));
  const mudarPremissa = (chave: keyof Premissas) => (ligado: boolean) =>
    setPremissas((atual) => ({ ...atual, [chave]: ligado }));
  const mudarPreco = (id: IdPreco) => (valor: number) =>
    setPrecos((atual) => ({ ...atual, [id]: valor }));

  const normal = normalizar(entradas);
  const { azure, github } = comparar(entradas, premissas, precos);
  const maior = Math.max(azure.mensalUsd, github.mensalUsd, 1);
  const varias = normal.organizacoes > 1;
  const algumGhas = entradas.ghasGitHub || entradas.ghazdo;
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
          Azure DevOps por organização contra GitHub com Actions, por pessoa. Preços públicos
          oficiais, verificados em {VERIFICADO_EM}. Todo campo é editável.
        </>
      }
    >
      <Revelar className="calc">
        <form
          className="calc-form"
          aria-label="Entradas"
          onSubmit={(evento) => evento.preventDefault()}
        >
          <fieldset>
            <legend>Pessoas e organizações</legend>
            <CampoNumero
              rotulo="Pessoas (devs)"
              valor={entradas.pessoas}
              aoMudar={mudar("pessoas")}
              dica="Total de pessoas distintas, somando todas as orgs."
            />
            <CampoNumero
              rotulo="Organizações Azure DevOps"
              valor={entradas.organizacoes}
              aoMudar={mudar("organizacoes")}
              min={1}
            />
            <CampoNumero
              rotulo="Devs com acesso cruzado"
              valor={entradas.pessoasCruzadas}
              aoMudar={mudar("pessoasCruzadas")}
              max={normal.pessoas}
              desligado={!varias}
              dica={
                varias ? "Entram em mais de uma org." : "Com uma org só, não há acesso cruzado."
              }
            />
            <CampoNumero
              rotulo="Média de orgs por dev cruzado"
              valor={entradas.mediaOrgsCruzadas}
              aoMudar={mudar("mediaOrgsCruzadas")}
              min={1}
              max={normal.organizacoes}
              passo={0.5}
              desligado={!varias}
            />
            <CampoNumero
              rotulo="Usuários com Test Plans"
              valor={entradas.usuariosTestPlans}
              aoMudar={mudar("usuariosTestPlans")}
              max={normal.pessoas}
            />
            <CampoNumero
              rotulo="Desses, com acesso cruzado"
              valor={entradas.testersCruzados}
              aoMudar={mudar("testersCruzados")}
              desligado={!varias}
            />
            <CampoNumero
              rotulo="Stakeholders"
              valor={entradas.stakeholders}
              aoMudar={mudar("stakeholders")}
              dica="Fora da conta de devs."
            />
          </fieldset>

          <fieldset>
            <legend>Pipelines</legend>
            <CampoNumero
              rotulo="Minutos de pipeline por mês"
              valor={entradas.minutosMes}
              aoMudar={mudar("minutosMes")}
              passo={500}
              dica="Total de todas as orgs; valor de exemplo."
            />
            <CampoNumero
              rotulo="% dos minutos em self-hosted"
              valor={entradas.percentualSelfHosted}
              aoMudar={mudar("percentualSelfHosted")}
              max={100}
              passo={10}
            />
            <CampoNumero
              rotulo="Jobs paralelos Microsoft-hosted por org"
              valor={entradas.jobsMicrosoftPorOrg}
              aoMudar={mudar("jobsMicrosoftPorOrg")}
            />
            <CampoNumero
              rotulo="Jobs paralelos self-hosted por org"
              valor={entradas.jobsSelfHostedPorOrg}
              aoMudar={mudar("jobsSelfHostedPorOrg")}
              dica="O primeiro é grátis."
            />
            <div className="campo">
              <label htmlFor={idRunner}>Runner hospedado do GitHub</label>
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
          </fieldset>

          <fieldset>
            <legend>GitHub e segurança</legend>
            <Escolha
              rotulo="Plano GitHub"
              valor={entradas.planoGitHub}
              opcoes={PLANOS}
              aoMudar={mudar("planoGitHub")}
            />
            <Interruptor
              rotulo="GHAS no GitHub"
              ligado={entradas.ghasGitHub}
              aoMudar={mudar("ghasGitHub")}
            >
              <small>Ligado por padrão: a segurança roda no pipeline do GitHub.</small>
            </Interruptor>
            <Interruptor
              rotulo="GHAzDO no Azure DevOps"
              ligado={entradas.ghazdo}
              aoMudar={mudar("ghazdo")}
            >
              <small>Desligado por padrão: o uso atual do Azure DevOps não tem GHAzDO.</small>
            </Interruptor>
            <Interruptor
              rotulo="Code Security"
              ligado={entradas.codeSecurity}
              aoMudar={mudar("codeSecurity")}
              desligado={!algumGhas}
            />
            <Interruptor
              rotulo="Secret Protection"
              ligado={entradas.secretProtection}
              aoMudar={mudar("secretProtection")}
              desligado={!algumGhas}
            />
            <CampoNumero
              rotulo="Committers ativos (90 dias)"
              valor={entradas.committersAtivos}
              aoMudar={mudar("committersAtivos")}
              desligado={!algumGhas}
              dica="Começa igual ao número de pessoas: todo dev commita."
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
            nome="Azure DevOps"
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

      <Revelar className="premissas">
        <h3>Premissas</h3>
        <p className="note">Cada uma começa no padrão oficial. Mude para testar o seu cenário.</p>
        <div className="lista-premissas">
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
              const origem = origemDoPreco(ficha.id, precos[ficha.id]);
              return (
                <tr key={ficha.id}>
                  <th scope="row">
                    {ficha.item}
                    <small>{ficha.plataforma}</small>
                  </th>
                  <td>
                    <input
                      type="number"
                      aria-label={`Preço de ${ficha.item}`}
                      min={0}
                      step="any"
                      value={Number.isFinite(precos[ficha.id]) ? precos[ficha.id] : ""}
                      onChange={(evento) => mudarPreco(ficha.id)(evento.target.valueAsNumber)}
                    />
                  </td>
                  <td>{ficha.unidade}</td>
                  <td>
                    <span className={origem === "oficial" ? "selo ok" : "selo est"}>{origem}</span>{" "}
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
        Preço editado vira estimativa. Fora da conta: Artifacts acima de 2 GiB, storage do Actions,
        plano antigo por minuto e assinaturas Visual Studio.
      </p>
    </Secao>
  );
}
