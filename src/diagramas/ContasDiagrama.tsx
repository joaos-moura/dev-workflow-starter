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

function Seta({ de, para }: { de: Ponto; para: Ponto }) {
  return (
    <line
      x1={de.x + LARGURA / 2}
      y1={de.y + ALTURA + 2}
      x2={para.x + LARGURA / 2}
      y2={para.y - 10}
      stroke="#1e6844"
      strokeWidth={1.6}
      markerEnd="url(#seta-contas)"
    />
  );
}

export function ContasDiagrama() {
  const sso = { x: 345, y: 12 };
  const dev = { x: 16, y: 150 };
  const hml = { x: 226, y: 150 };
  const prd = { x: 436, y: 150 };
  const shared = { x: 646, y: 150 };

  return (
    <svg
      className="diagrama"
      viewBox="0 0 820 232"
      role="img"
      aria-label="Contas Dev, HML, PRD e Shared com acesso por SSO"
    >
      <defs>
        <marker id="seta-contas" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#1e6844" />
        </marker>
      </defs>
      <Seta de={sso} para={dev} />
      <Seta de={sso} para={hml} />
      <Seta de={sso} para={prd} />
      <Seta de={sso} para={shared} />
      <Caixa {...sso} titulo="SSO" detalhe="sem chave" />
      <Caixa {...dev} titulo="Dev" detalhe="o time constrói" />
      <Caixa {...hml} titulo="HML" detalhe="homologação" />
      <Caixa {...prd} titulo="PRD" detalhe="produção" />
      <Caixa {...shared} titulo="Shared" detalhe="opcional" />
    </svg>
  );
}
