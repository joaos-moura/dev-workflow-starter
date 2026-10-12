import { Secao } from "../componentes/Secao";

const OBJETIVOS = [
  {
    titulo: "Autonomia",
    texto: "O time tem a própria conta Dev e publica sem pedir acesso a cada serviço.",
  },
  {
    titulo: "Qualidade no dia a dia",
    texto:
      "O CI é honesto e a observabilidade já nasce no template: lint, teste, build, log do Actions e health da API.",
  },
  {
    titulo: "Integração",
    texto: "O GitHub é o hub. Código, pipeline, preview e promoção passam por ele.",
  },
  {
    titulo: "IA com guardrails",
    texto:
      "A automação acelera o trabalho. O CI, o review e o CODEOWNERS decidem o que chega na main.",
  },
] as const;

export function Objetivos() {
  return (
    <Secao id="objetivos" titulo="Quatro objetivos">
      <div className="grade">
        {OBJETIVOS.map((objetivo) => (
          <article className="cartao" key={objetivo.titulo}>
            <h3>{objetivo.titulo}</h3>
            <p>{objetivo.texto}</p>
          </article>
        ))}
      </div>
    </Secao>
  );
}
