import { useEffect, useRef, useState } from "react";
import { Secao } from "../componentes/Secao";
import { observar, useRevelado, useSemObservador } from "../movimento";

const CAMPOS = [
  { rotulo: "Nome do serviço", valor: "pagamentos-api" },
  { rotulo: "Tipo de serviço", valor: "API · Node" },
  { rotulo: "Time", valor: "checkout" },
] as const;

const PASSOS = [
  "Repositório criado",
  "Pipeline configurada",
  "Role OIDC criada",
  "Infra Dev provisionada",
  "Registrado no catálogo",
] as const;

const MS_POR_CARACTERE = 70;
const MS_POR_PASSO = 650;
const LIMIAR_DO_CICLO = 0.4;

type EstadoPasso = "espera" | "rodando" | "feito";

type Quadro = {
  textos: readonly string[];
  foco: number | null;
  ponteiro: { left: string; top: string };
  apertado: boolean;
  passos: readonly EstadoPasso[];
  pronto: boolean;
};

const PONTEIRO_FORA = { left: "70%", top: "110%" };

const INICIAL: Quadro = {
  textos: CAMPOS.map(() => ""),
  foco: null,
  ponteiro: PONTEIRO_FORA,
  apertado: false,
  passos: PASSOS.map(() => "espera"),
  pronto: false,
};

const FINAL: Quadro = {
  ...INICIAL,
  textos: CAMPOS.map((campo) => campo.valor),
  passos: PASSOS.map(() => "feito"),
  pronto: true,
};

function classeDoPasso(estado: EstadoPasso): string {
  switch (estado) {
    case "espera":
      return "st";
    case "rodando":
      return "st wk";
    case "feito":
      return "st on";
    default: {
      const nunca: never = estado;
      return nunca;
    }
  }
}

function useCicloDoPortal(semObservador: boolean) {
  const demoRef = useRef<HTMLDivElement>(null);
  const janelaRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLSpanElement>(null);
  // Começa no estado final: se o ciclo nunca rodar, o formulário continua legível.
  const [quadro, setQuadro] = useState<Quadro>(FINAL);

  useEffect(() => {
    const demo = demoRef.current;
    if (semObservador || !demo) return;

    let ativo = true;
    let visivel = false;
    let rodando = false;
    const relogios = new Set<number>();
    const esperar = (ms: number) =>
      new Promise<void>((resolver) => {
        const id = window.setTimeout(() => {
          relogios.delete(id);
          if (ativo) resolver();
        }, ms);
        relogios.add(id);
      });
    const atualizar = (mudanca: (anterior: Quadro) => Partial<Quadro>) =>
      setQuadro((anterior) => ({ ...anterior, ...mudanca(anterior) }));

    async function ciclo() {
      rodando = true;
      setQuadro(INICIAL);
      await esperar(500);

      for (const [indice, campo] of CAMPOS.entries()) {
        atualizar(() => ({ foco: indice }));
        const letras = Array.from(campo.valor);
        for (let n = 1; n <= letras.length; n += 1) {
          const parcial = letras.slice(0, n).join("");
          atualizar(({ textos }) => ({
            textos: textos.map((texto, j) => (j === indice ? parcial : texto)),
          }));
          await esperar(MS_POR_CARACTERE);
        }
        await esperar(250);
        atualizar(() => ({ foco: null }));
      }

      const botao = botaoRef.current?.getBoundingClientRect();
      const janela = janelaRef.current?.getBoundingClientRect();
      if (botao && janela) {
        atualizar(() => ({
          ponteiro: {
            left: `${botao.left - janela.left + botao.width / 2}px`,
            top: `${botao.top - janela.top + botao.height / 2}px`,
          },
        }));
      }
      await esperar(900);
      atualizar(() => ({ apertado: true }));
      await esperar(180);
      atualizar(() => ({ apertado: false }));

      for (const indice of PASSOS.keys()) {
        const marcar = (estado: EstadoPasso) =>
          atualizar(({ passos }) => ({
            passos: passos.map((atual, j) => (j === indice ? estado : atual)),
          }));
        marcar("rodando");
        await esperar(MS_POR_PASSO);
        marcar("feito");
      }

      await esperar(200);
      atualizar(() => ({ pronto: true }));
      await esperar(3000);
      rodando = false;
      if (visivel) void ciclo();
    }

    const pararDeObservar = observar(
      demo,
      LIMIAR_DO_CICLO,
      (agora) => {
        visivel = agora;
        if (visivel && !rodando) void ciclo();
      },
      () => {},
    );

    return () => {
      ativo = false;
      pararDeObservar();
      relogios.forEach((id) => window.clearTimeout(id));
    };
  }, [semObservador]);

  return { demoRef, janelaRef, botaoRef, quadro: semObservador ? FINAL : quadro };
}

export function Portal() {
  const semObservador = useSemObservador();
  const { demoRef, janelaRef, botaoRef, quadro } = useCicloDoPortal(semObservador);
  const revelado = useRevelado(demoRef);

  return (
    <Secao
      id="portal"
      numero="03"
      rotulo="O portal"
      titulo="O dev preenche três campos. O resto acontece sozinho."
      sub="O Backstage vira a porta de entrada de tudo. Ninguém precisa tocar em GitHub, AWS ou Terraform para ter um serviço no ar em Dev."
    >
      <div ref={demoRef} className={revelado ? "portal rv vis" : "portal rv"}>
        <div className="win" ref={janelaRef}>
          <div className="wbar">
            <i />
            <i />
            <i />
            <span>Backstage · Criar serviço</span>
          </div>
          <div className="form">
            {CAMPOS.map((campo, indice) => (
              <div key={campo.rotulo}>
                <div className="fl">{campo.rotulo}</div>
                <div className={quadro.foco === indice ? "in f" : "in"}>
                  <span className="t">{quadro.textos[indice]}</span>
                </div>
              </div>
            ))}
            <span ref={botaoRef} className={quadro.apertado ? "go press" : "go"}>
              Criar
            </span>
          </div>
          <div className="mouse" style={quadro.ponteiro} aria-hidden="true" />
        </div>
        <div className="win">
          <div className="wbar">
            <i />
            <i />
            <i />
            <span>em background</span>
          </div>
          <div className="run">
            <ul className="lista-run">
              {PASSOS.map((passo, indice) => (
                <li key={passo} className={classeDoPasso(quadro.passos[indice] ?? "espera")}>
                  <b aria-hidden="true" />
                  {passo}
                </li>
              ))}
            </ul>
            <div className={quadro.pronto ? "done on" : "done"}>
              Serviço no ar em Dev <small>pagamentos-api.dev</small>
            </div>
          </div>
        </div>
      </div>
    </Secao>
  );
}
