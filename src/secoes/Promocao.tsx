import { useRef, type CSSProperties } from "react";
import { Icone } from "../componentes/Icone";
import { Secao } from "../componentes/Secao";
import { useTrilho } from "../rolagem";

const ETAPAS = [
  { id: "dev", titulo: "Dev", nota: "ECR · mesma imagem · smoke", ini: 0, tom: "" },
  { id: "hml", titulo: "HML", nota: "E2E · k6", ini: 0.16, tom: "" },
  { id: "gate-hml", titulo: "Datadog", nota: "p95 · erro · para se piorar", ini: 0.32, tom: "k" },
  { id: "prd", titulo: "PRD", nota: "Aprovação manual", ini: 0.48, tom: "" },
  { id: "canario", titulo: "Canário", nota: "10% · espera os monitores", ini: 0.62, tom: "k" },
  { id: "monitores", titulo: "Monitores", nota: "Erro · latência · APM", ini: 0.74, tom: "k" },
] as const;

const SELOS = [
  "env · service · version",
  "OIDC · um papel por conta",
  "Sem chave no GitHub",
  "Sem rebuild",
] as const;

function estiloIni(ini: number): CSSProperties {
  return { "--ini": ini } as CSSProperties;
}

export function Promocao() {
  const ref = useRef<HTMLDivElement>(null);
  useTrilho(ref);

  return (
    <Secao id="promocao" numero="11" rotulo="Promoção" titulo="A mesma imagem segue.">
      <div
        ref={ref}
        className="fluxo"
        data-diagrama="promocao"
        data-estado="final"
        role="group"
        aria-label="Dev, HML e PRD com o Datadog na porta"
        aria-describedby="promo-legenda"
      >
        <ol className="degraus">
          {ETAPAS.map((etapa) => (
            <li
              key={etapa.id}
              className={etapa.tom ? `etapa node ${etapa.tom}` : "etapa node"}
              style={estiloIni(etapa.ini)}
            >
              {etapa.tom === "k" ? (
                <span className="marca acento">
                  <Icone nome="grafico" />
                </span>
              ) : null}
              <b>{etapa.titulo}</b>
              <span>{etapa.nota}</span>
              {etapa.id === "canario" ? (
                <span className="trilho-canario" aria-hidden="true">
                  <i />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="fork">
          <div className="etapa node bom" style={estiloIni(0.84)}>
            <span className="marca ok">
              <Icone nome="grafico" />
            </span>
            <b>Verde</b>
            <span>100% · evento de deploy</span>
          </div>
          <div className="etapa node ruim" style={estiloIni(0.84)}>
            <span className="marca alerta">
              <Icone nome="volta" />
            </span>
            <b>Vermelho</b>
            <span>Rollback automático</span>
          </div>
        </div>
        <ul className="pronto" id="promo-legenda">
          {SELOS.map((selo) => (
            <li key={selo}>{selo}</li>
          ))}
        </ul>
      </div>
    </Secao>
  );
}
