import { Secao } from "../componentes/Secao";

const PASSOS = [
  "Gere um repositório a partir deste template, pelo GitHub ou pelo workflow novo-projeto.",
  "Abra a pasta no devcontainer. Ele instala as dependências e deixa o Terraform disponível. Fora do container, use Node 22, npm ci e npm run dev.",
  "Abra um pull request. O CI roda lint, teste e build. O reviewdog comenta o ESLint.",
  "Sem a variável AWS_ROLE_ARN, os jobs da AWS terminam verdes e não criam recurso. Com a variável, o workflow garante o bucket de estado, comenta o plan, publica o preview no workspace pr-<número> e comenta a URL.",
  "O merge na main é a aprovação: aplica o workspace dev e publica o GitHub Pages.",
  "Fechar o pull request destrói o workspace do preview.",
] as const;

export function ComoUsar() {
  return (
    <Secao id="como-usar" titulo="Como usar">
      <ol className="passos">
        {PASSOS.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>
    </Secao>
  );
}
