import type { ReactNode } from "react";

type Propriedades = {
  id: string;
  titulo: string;
  children: ReactNode;
};

export function Secao({ id, titulo, children }: Propriedades) {
  const tituloId = `${id}-titulo`;

  return (
    <section className="secao" id={id} aria-labelledby={tituloId}>
      <h2 id={tituloId}>{titulo}</h2>
      {children}
    </section>
  );
}
