export type StatusRadar = "adotar" | "avaliar" | "segurar";

export type ItemRadar = {
  nome: string;
  status: StatusRadar;
  nota?: string;
};

export const ITENS_RADAR: readonly ItemRadar[] = [
  { nome: "Terraform", status: "adotar" },
  { nome: "GitHub Actions", status: "adotar" },
  { nome: "React", status: "adotar" },
  { nome: "Node", status: "adotar" },
  { nome: "Postgres", status: "adotar" },
  { nome: "ECS Fargate", status: "avaliar" },
  { nome: "Next", status: "avaliar" },
  { nome: ".NET", status: "avaliar" },
  { nome: "Backstage", status: "avaliar" },
  { nome: "Datadog", status: "segurar", nota: "na versão empresa" },
  { nome: "GitHub Enterprise", status: "segurar", nota: "na versão empresa" },
  {
    nome: "GitHub Advanced Security",
    status: "segurar",
    nota: "na versão empresa",
  },
];

export function rotuloStatus(status: StatusRadar): string {
  switch (status) {
    case "adotar":
      return "Adotar";
    case "avaliar":
      return "Avaliar";
    case "segurar":
      return "Segurar";
    default: {
      const nunca: never = status;
      return nunca;
    }
  }
}

export function agruparRadar(
  itens: readonly ItemRadar[],
): Record<StatusRadar, readonly ItemRadar[]> {
  const grupos: Record<StatusRadar, ItemRadar[]> = {
    adotar: [],
    avaliar: [],
    segurar: [],
  };

  for (const item of itens) {
    grupos[item.status].push(item);
  }

  return grupos;
}
