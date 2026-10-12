import { useRef, type ReactNode } from "react";
import { useRevelado } from "../movimento";

type Propriedades = {
  className?: string;
  children: ReactNode;
};

export function Revelar({ className, children }: Propriedades) {
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useRevelado(ref);
  const classes = ["rv", visivel && "vis", className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
