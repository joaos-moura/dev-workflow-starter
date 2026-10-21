import { Secao } from "../componentes/Secao";

const ANTES = [
  { nome: "PR", classe: "" },
  { nome: "Build", classe: "" },
  { nome: "HML", classe: "x" },
  { nome: "PRD", classe: "dim" },
] as const;

const DEPOIS = [
  { nome: "PR", classe: "cedo" },
  { nome: "Build", classe: "" },
  { nome: "HML", classe: "" },
  { nome: "PRD", classe: "" },
] as const;

function Trilho({
  tom,
  rotulo,
  notaId,
  nota,
  paradas,
}: {
  tom: "a" | "b";
  rotulo: string;
  notaId: string;
  nota: string;
  paradas: readonly { nome: string; classe: string }[];
}) {
  return (
    <div className={`lane ${tom}`} aria-labelledby={notaId}>
      <small>{rotulo}</small>
      <div className="track">
        <div className="tok" aria-hidden="true" />
        {paradas.map((parada) => (
          <div key={parada.nome} className={parada.classe ? `stop ${parada.classe}` : "stop"}>
            <i aria-hidden="true" />
            {parada.nome}
          </div>
        ))}
      </div>
      <p id={notaId}>{nota}</p>
    </div>
  );
}

export function Pipeline() {
  return (
    <Secao id="pipeline" numero="08" rotulo="Pipeline" titulo="O erro muda de lugar." alt>
      <div
        className="par"
        data-diagrama="antes-depois"
        role="group"
        aria-label="Antes e depois"
        aria-describedby="nota-antes nota-depois"
      >
        <Trilho
          tom="b"
          rotulo="Antes"
          notaId="nota-antes"
          nota="Erro só em HML · dias"
          paradas={ANTES}
        />
        <Trilho
          tom="a"
          rotulo="Depois"
          notaId="nota-depois"
          nota="Erro no PR · minutos"
          paradas={DEPOIS}
        />
      </div>
    </Secao>
  );
}
