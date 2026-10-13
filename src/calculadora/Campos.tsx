import { useId, type ReactNode } from "react";

type PropriedadesNumero = {
  rotulo: string;
  valor: number;
  aoMudar: (valor: number) => void;
  min?: number;
  max?: number;
  passo?: number;
  dica?: ReactNode;
  desligado?: boolean;
};

export function CampoNumero({
  rotulo,
  valor,
  aoMudar,
  min = 0,
  max,
  passo = 1,
  dica,
  desligado = false,
}: PropriedadesNumero) {
  const id = useId();
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={passo}
        value={Number.isFinite(valor) ? valor : ""}
        disabled={desligado}
        onChange={(evento) => aoMudar(evento.target.valueAsNumber)}
      />
      {dica && <small>{dica}</small>}
    </div>
  );
}

type PropriedadesInterruptor = {
  rotulo: string;
  ligado: boolean;
  aoMudar: (ligado: boolean) => void;
  children?: ReactNode;
  desligado?: boolean;
};

export function Interruptor({
  rotulo,
  ligado,
  aoMudar,
  children,
  desligado = false,
}: PropriedadesInterruptor) {
  return (
    <label className={desligado ? "chave off" : "chave"}>
      <input
        type="checkbox"
        role="switch"
        checked={ligado}
        disabled={desligado}
        onChange={(evento) => aoMudar(evento.target.checked)}
      />
      <span className="trilho" aria-hidden="true" />
      <span className="txt">
        <b>{rotulo}</b>
        {children}
      </span>
    </label>
  );
}

type Opcao<T extends string> = { valor: T; rotulo: string };

type PropriedadesEscolha<T extends string> = {
  rotulo: string;
  valor: T;
  opcoes: readonly Opcao<T>[];
  aoMudar: (valor: T) => void;
};

export function Escolha<T extends string>({
  rotulo,
  valor,
  opcoes,
  aoMudar,
}: PropriedadesEscolha<T>) {
  const nome = useId();
  return (
    <fieldset className="escolha">
      <legend>{rotulo}</legend>
      <div>
        {opcoes.map((opcao) => (
          <label key={opcao.valor} className={opcao.valor === valor ? "on" : undefined}>
            <input
              type="radio"
              name={nome}
              checked={opcao.valor === valor}
              onChange={() => aoMudar(opcao.valor)}
            />
            {opcao.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
