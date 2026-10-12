const LARGURA = 150;
const ALTURA = 64;

type Ponto = {
  x: number;
  y: number;
};

function Caixa({ x, y, titulo, detalhe }: Ponto & { titulo: string; detalhe: string }) {
  return (
    <g>
      <rect x={x} y={y} width={LARGURA} height={ALTURA} rx={12} fill="#fffdf9" stroke="#e3dcd0" />
      <text x={x + LARGURA / 2} y={y + 27} textAnchor="middle" fontSize={16} fill="#1d1b17">
        {titulo}
      </text>
      <text x={x + LARGURA / 2} y={y + 46} textAnchor="middle" fontSize={12} fill="#5e584e">
        {detalhe}
      </text>
    </g>
  );
}

function Seta({ de, para, vertical = false }: { de: Ponto; para: Ponto; vertical?: boolean }) {
  const x1 = vertical ? de.x + LARGURA / 2 : de.x + LARGURA + 2;
  const y1 = vertical ? de.y + ALTURA + 2 : de.y + ALTURA / 2;
  const x2 = vertical ? para.x + LARGURA / 2 : para.x - 10;
  const y2 = vertical ? para.y - 10 : para.y + ALTURA / 2;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#1e6844"
      strokeWidth={1.6}
      markerEnd="url(#seta-fluxo)"
    />
  );
}

export function Fluxo() {
  const github = { x: 16, y: 18 };
  const actions = { x: 210, y: 18 };
  const oidc = { x: 404, y: 18 };
  const aws = { x: 598, y: 18 };
  const pages = { x: 210, y: 158 };
  const s3 = { x: 470, y: 158 };
  const lambda = { x: 680, y: 158 };

  return (
    <svg
      className="diagrama"
      viewBox="0 0 850 246"
      role="img"
      aria-label="Fluxo do GitHub ao Actions, OIDC, S3, Lambda e Pages"
    >
      <defs>
        <marker id="seta-fluxo" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#1e6844" />
        </marker>
      </defs>
      <Seta de={github} para={actions} />
      <Seta de={actions} para={oidc} />
      <Seta de={oidc} para={aws} />
      <Seta de={actions} para={pages} vertical />
      <Seta de={aws} para={s3} vertical />
      <Seta de={aws} para={lambda} vertical />
      <Caixa {...github} titulo="GitHub" detalhe="repositório" />
      <Caixa {...actions} titulo="Actions" detalhe="pipeline" />
      <Caixa {...oidc} titulo="OIDC" detalhe="papel" />
      <Caixa {...aws} titulo="AWS" detalhe="conta Dev" />
      <Caixa {...pages} titulo="Pages" detalhe="site público" />
      <Caixa {...s3} titulo="S3" detalhe="site" />
      <Caixa {...lambda} titulo="Lambda" detalhe="API" />
    </svg>
  );
}
