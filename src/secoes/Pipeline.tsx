import { Icone } from "../componentes/Icone";
import { Secao } from "../componentes/Secao";

const ANTES = [
  { nome: "PR", classe: "", estado: "", escudo: false },
  { nome: "Build", classe: "", estado: "", escudo: false },
  { nome: "HML", classe: "x", estado: "", escudo: false },
  { nome: "PRD", classe: "dim", estado: "", escudo: false },
] as const;

const DEPOIS = [
  { nome: "PR", classe: "cedo", estado: "corrigido", escudo: true },
  { nome: "Build", classe: "", estado: "ok", escudo: false },
  { nome: "HML", classe: "", estado: "ok", escudo: false },
  { nome: "PRD", classe: "", estado: "ok", escudo: false },
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
  paradas: readonly {
    nome: string;
    classe: string;
    estado: "" | "ok" | "corrigido";
    escudo: boolean;
  }[];
}) {
  return (
    <div className={`lane ${tom}`} aria-labelledby={notaId}>
      <small>{rotulo}</small>
      <div className="track">
        {tom === "b" ? <div className="tok" aria-hidden="true" /> : null}
        {paradas.map((parada) => (
          <div
            key={parada.nome}
            className={parada.classe ? `stop ${parada.classe}` : "stop"}
            {...(parada.estado ? { "data-estado": parada.estado } : {})}
            {...(parada.escudo ? { role: "img", "aria-label": "erro pego e corrigido" } : {})}
          >
            <i aria-hidden="true">
              {parada.escudo ? (
                <span className="tok">
                  <Icone nome="escudo" />
                </span>
              ) : null}
            </i>
            {parada.escudo ? <span aria-hidden="true">{parada.nome}</span> : parada.nome}
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
          nota="Erro pego no PR, em minutos, e corrigido antes do build"
          paradas={DEPOIS}
        />
      </div>
    </Secao>
  );
}
