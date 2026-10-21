import type { CSSProperties } from "react";
import { Icone, type NomeIcone } from "../componentes/Icone";
import { Secao } from "../componentes/Secao";

const PRONTO = [
  { nome: "Checks em paralelo", i: 0 },
  { nome: "Imagem escaneada", i: 5 },
  { nome: "Preview com URL", i: 6 },
  { nome: "Plan no PR", i: 7 },
] as const;

const CHECAGENS = [
  { nome: "Lint", nota: "Estilo · check obrigatório" },
  { nome: "Testes", nota: "Cobertura mínima · check obrigatório" },
  { nome: "CodeQL", nota: "Achado no código · ruleset ou check" },
  { nome: "Secret scan", nota: "Segredo no git · check obrigatório" },
  { nome: "Dependências", nota: "Auditoria no CI · check obrigatório" },
] as const;

const ENTREGAS: readonly {
  nome: string;
  nota: string;
  icone: NomeIcone;
  i: number;
}[] = [
  { nome: "Imagem", nota: "SHA · Trivy · build único", icone: "imagem", i: 5 },
  { nome: "Preview", nota: "URL no comentário · some ao fechar", icone: "link", i: 6 },
  { nome: "Plan", nota: "Comentário no PR", icone: "comentario", i: 7 },
];

const COMENTARIOS = [
  { autor: "reviewdog", texto: "Lint · linha 12", i: 8 },
  { autor: "plan", texto: "Terraform · a1b2c3d", i: 7 },
] as const;

function atraso(indice: number): CSSProperties {
  return { "--i": indice } as CSSProperties;
}

export function PrAberto() {
  return (
    <Secao id="pr" numero="09" rotulo="No PR" titulo="Pronto antes do merge.">
      <div
        className="painel-pr"
        data-diagrama="pr-aberto"
        data-sequencia=""
        role="group"
        aria-label="O que já está pronto quando o PR abre"
        aria-describedby="pr-legenda"
      >
        <p className="selo" id="pr-legenda">
          Ilustração
        </p>
        <p className="faixa">O que já está pronto quando o PR abre</p>
        <p className="faixa">Em paralelo · minutos · antes da imagem</p>
        <ol className="pronto" aria-label="O que já está pronto quando o PR abre">
          {PRONTO.map((item) => (
            <li key={item.nome} data-passo="" style={atraso(item.i)}>
              {item.nome}
            </li>
          ))}
        </ol>
        <ul className="checks" aria-label="Ilustração da lista de checks">
          {CHECAGENS.map((checagem, indice) => (
            <li key={checagem.nome} className="st on" data-passo="" style={atraso(indice)}>
              <b aria-hidden="true" />
              <span>
                {checagem.nome}
                <small>{checagem.nota}</small>
              </span>
            </li>
          ))}
        </ul>
        <ul className="entregas">
          {ENTREGAS.map((entrega) => (
            <li key={entrega.nome} className="node" data-passo="" style={atraso(entrega.i)}>
              <span className="marca acento">
                <Icone nome={entrega.icone} />
              </span>
              <b>{entrega.nome}</b>
              <span>{entrega.nota}</span>
            </li>
          ))}
        </ul>
        <div className="comentarios" role="group" aria-label="Ilustração de comentários no PR">
          {COMENTARIOS.map((comentario) => (
            <p
              key={comentario.autor}
              className="comentario"
              data-passo=""
              style={atraso(comentario.i)}
            >
              <b>{comentario.autor}</b>
              <span>{comentario.texto}</span>
            </p>
          ))}
        </div>
      </div>
    </Secao>
  );
}
