import { useRef, type ReactNode } from "react";
import { useRevelado } from "../movimento";

type Propriedades = {
  id: string;
  numero: string;
  rotulo: string;
  titulo: string;
  sub?: ReactNode;
  alt?: boolean;
  children?: ReactNode;
};

export function Secao({ id, numero, rotulo, titulo, sub, alt = false, children }: Propriedades) {
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const tituloVisivel = useRevelado(tituloRef);
  const subVisivel = useRevelado(subRef);

  return (
    <section id={id} className={alt ? "alt" : undefined} aria-label={rotulo}>
      <div className="wrap">
        <p className="eyebrow">
          {numero} · {rotulo}
        </p>
        <h2 ref={tituloRef} className={tituloVisivel ? "rv vis" : "rv"}>
          {titulo}
        </h2>
        {sub && (
          <p ref={subRef} className={subVisivel ? "sub rv vis" : "sub rv"}>
            {sub}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
