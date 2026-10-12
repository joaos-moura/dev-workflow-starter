import { Secao } from "../componentes/Secao";

const ANTES = [
  "Só existe HML.",
  "A conta Dev não existe.",
  "Cada passo espera o time de infraestrutura.",
  "A espera dura dias.",
  "A governança de acesso à AWS trava o serviço.",
] as const;

const DEPOIS = [
  "O template entrega o padrão.",
  "O devcontainer deixa o ambiente local pronto em minutos.",
  "O pull request recebe CI, plan e preview.",
  "O merge aplica o ambiente dev.",
  "O acesso usa um papel OIDC, sem chave pessoal.",
] as const;

export function AntesDepois() {
  return (
    <Secao id="antes-depois" titulo="Antes e depois">
      <div className="comparacao">
        <article className="antes">
          <h3>Antes</h3>
          <ul>
            {ANTES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="depois">
          <h3>Depois</h3>
          <ul>
            {DEPOIS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </Secao>
  );
}
