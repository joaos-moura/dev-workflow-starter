import type { ReactNode } from "react";

export type NomeIcone =
  | "bloqueio"
  | "diff"
  | "pacote"
  | "cadeado"
  | "arquivo"
  | "imagem"
  | "link"
  | "comentario"
  | "grafico"
  | "volta"
  | "escudo";

function desenho(nome: NomeIcone): ReactNode {
  switch (nome) {
    case "bloqueio":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M7.5 16.5 16.5 7.5" />
        </>
      );
    case "diff":
      return (
        <>
          <path d="M5 7h14M5 12h8M5 17h6" />
          <path d="M15 15.2 17.2 17.4 21 13" />
        </>
      );
    case "pacote":
      return (
        <>
          <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" />
          <path d="M12 12 20 8M12 12 4 8M12 12v8.5" />
        </>
      );
    case "cadeado":
      return (
        <>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      );
    case "arquivo":
      return (
        <>
          <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M14 3.5V8h4M9 13h6M9 17h4" />
        </>
      );
    case "imagem":
      return (
        <>
          <rect x="4" y="7" width="16" height="12" rx="2" />
          <path d="M8 7V5h8v2" />
        </>
      );
    case "link":
      return (
        <>
          <path d="M10 13a4 4 0 0 0 6 0l2-2a4 4 0 0 0-6-6l-1 1" />
          <path d="M14 11a4 4 0 0 0-6 0l-2 2a4 4 0 0 0 6 6l1-1" />
        </>
      );
    case "comentario":
      return (
        <>
          <path d="M6 6h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H11l-4 3v-3H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        </>
      );
    case "grafico":
      return (
        <>
          <path d="M5 19V5M5 19h14" />
          <path d="M9 15v-3M13 15V8M17 15v-5" />
        </>
      );
    case "volta":
      return <path d="M8 8H4v4M4.5 8A8 8 0 1 1 6 17.5" />;
    case "escudo":
      return (
        <>
          <path d="M12 3.2 19 6v5.4c0 3.6-2.7 6.3-7 8.4-4.3-2.1-7-4.8-7-8.4V6l7-2.8Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      );
    default: {
      const nunca: never = nome;
      return nunca;
    }
  }
}

export function Icone({ nome }: { nome: NomeIcone }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {desenho(nome)}
    </svg>
  );
}
