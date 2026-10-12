import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";

const CONTAS = [
  { nome: "Dev", texto: "preview por PR + dev fixo", classe: "ac d" },
  { nome: "HML", texto: "homologação", classe: "ac" },
  { nome: "PRD", texto: "produção", classe: "ac" },
  { nome: "Shared", texto: "opcional", classe: "ac o" },
] as const;

export function Contas() {
  return (
    <Secao
      id="contas"
      numero="06"
      rotulo="Contas por ambiente"
      titulo="Cada ambiente mora na própria conta."
      sub="Acesso por SSO, sem usuários IAM e sem chaves de acesso pessoais. Shared é opcional, para o que for de fato comum."
    >
      <Revelar className="accts">
        {CONTAS.map((conta) => (
          <div className={conta.classe} key={conta.nome}>
            <b>{conta.nome}</b>
            <p>{conta.texto}</p>
          </div>
        ))}
      </Revelar>
      <div className="sso">AWS SSO · papéis por repositório · sem usuário IAM</div>
    </Secao>
  );
}
