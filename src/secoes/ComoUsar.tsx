import { Revelar } from "../componentes/Revelar";
import { Secao } from "../componentes/Secao";

export function ComoUsar() {
  return (
    <Secao
      id="usar"
      numero="14"
      rotulo="Como usar"
      titulo="Do template ao preview em seis passos."
      alt
    >
      <Revelar className="steps">
        <ol>
          <li>
            <b>Gere o repositório</b>Pelo GitHub ou pelo workflow novo-projeto.
          </li>
          <li>
            <b>Abra no devcontainer</b>Dependências e Terraform prontos. Fora dele: Node 22.
          </li>
          <li>
            <b>Abra um pull request</b>CI roda lint, teste e build; reviewdog comenta o ESLint.
          </li>
          <li>
            <b>Defina AWS_ROLE_ARN</b>O workflow garante o bucket de estado, comenta o plan e
            publica o preview em <code className="i">pr-&lt;n&gt;</code>. O comentário do preview
            traz o site no S3 e a URL da API na Lambda.
          </li>
          <li>
            <b>Faça o merge</b>Aplica o workspace dev e publica o GitHub Pages.
          </li>
          <li>
            <b>Feche o PR</b>O workspace do preview é destruído.
          </li>
        </ol>
        <pre>
          <span className="bar">
            <span>terminal</span>
            <span>bash</span>
          </span>
          <code>
            <span className="c"># fora do devcontainer</span>
            {"\nnpm ci\nnpm run dev\n\n"}
            <span className="c"># habilita os jobs da AWS (variável do repositório)</span>
            {"\ngh variable set "}
            <span className="k2">AWS_ROLE_ARN</span>
            {" \\\n  --body "}
            <span className="s">
              &quot;arn:aws:iam::&lt;conta&gt;:role/github-&lt;repo&gt;-deploy&quot;
            </span>
          </code>
        </pre>
      </Revelar>
      <p className="note">
        Nada é criado na AWS enquanto a variável AWS_ROLE_ARN não existir. O lock do state usa o
        use_lockfile do S3, sem tabela extra.
      </p>
    </Secao>
  );
}
