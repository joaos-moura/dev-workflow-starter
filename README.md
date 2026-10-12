# dev-workflow-starter

Template gratuito para um time que hoje só tem homologação. Ele entrega o site, o CI, o devcontainer e a infraestrutura em Terraform. Nada é pago. Sem a variável `AWS_ROLE_ARN`, nenhum recurso é criado na AWS e os workflows terminam verdes.

O site explica o padrão: [GitHub Pages](https://joaos-moura.github.io/dev-workflow-starter/).

## O desafio

Numa empresa de médio porte, o time só tem HML. A conta Dev não existe. Cada serviço novo espera o time de infraestrutura em todo passo, e o maior bloqueio é a governança de acesso à AWS. A espera dura dias.

## Antes e depois

| Antes                                      | Depois                                          |
| ------------------------------------------ | ----------------------------------------------- |
| Só existe HML                              | A conta Dev é separada                          |
| Cada passo espera o time de infraestrutura | O template abre repositório, pipeline e padrão  |
| A espera dura dias                         | O devcontainer fica pronto em minutos           |
| O acesso à AWS trava o serviço             | O deploy usa um papel OIDC, sem chave de acesso |

## Onboarding

O devcontainer usa a imagem Node 22 e instala o Terraform 1.16.5. Ao abrir, ele roda `npm ci` e `terraform init -backend=false`.

1. Abra esta pasta no devcontainer.
2. Rode `npm run dev` e acesse `http://localhost:5173/dev-workflow-starter/`.
3. Confira com `npm run lint`, `npm test` e `npm run build`.

Sem o devcontainer, use Node 22:

```bash
npm ci
npm run dev
```

O Vite publica o site com a base `/dev-workflow-starter/`, que é o caminho do GitHub Pages. O workflow da AWS gera outro build com `--base /` para a raiz do bucket.

## O que o template traz

- Site em React, Vite e TypeScript, com Vitest, ESLint e Prettier.
- CI em todo pull request: lint, teste, build e `terraform validate`.
- GitHub Pages a cada push na `main`, com `actions/configure-pages` (`enablement: true`) e `actions/deploy-pages`.
- CodeQL, Dependabot (npm, GitHub Actions e Terraform) e reviewdog comentando o ESLint no pull request.
- CODEOWNERS, modelo de pull request e modelos de issue (bug e funcionalidade).
- Devcontainer igual ao CI.
- Terraform inerte: bucket S3 do site e uma Lambda mínima (128 MB, URL de função). Em produção o runtime seria ECS Fargate.
- Preview por pull request no workspace `pr-<número>`, destruído quando o PR fecha.
- Ambiente `dev` aplicado no merge da `main`.
- Workflow manual `novo-projeto` para gerar outro repositório a partir deste template.

## Terraform

A pasta `infra/` descreve, para cada workspace:

- um bucket S3 de site, com prefixo `dws-`;
- uma função Lambda `dws-<ambiente>-api` e o papel `dws-<ambiente>-api`.

A conta só autoriza criar papéis com o prefixo `dws-`. Todo papel criado pelo Terraform segue esse prefixo.

O preview usa o workspace `pr-<número>`. O ambiente fixo usa o workspace `dev`. O state de cada um fica isolado no mesmo bucket:

`env:/<workspace>/dev-workflow-starter/terraform.tfstate`

O lock é o `use_lockfile` do S3, nativo do Terraform 1.10 ou mais novo. Não há tabela DynamoDB. Se um dia o lock em arquivo não servir, a alternativa é uma tabela DynamoDB cujo nome também comece com `dws-`. Este repositório não cria essa tabela.

Validar localmente não pede credencial:

```bash
terraform -chdir=infra fmt -check -recursive
terraform -chdir=infra init -backend=false
terraform -chdir=infra validate
```

## Configurar a AWS

A demonstração usa uma conta Dev separada da HML e da PRD.

| Item             | Valor                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Conta            | `642155085958`                                                      |
| Região           | `us-east-1`                                                         |
| Papel de deploy  | `arn:aws:iam::642155085958:role/github-dev-workflow-starter-deploy` |
| Bucket de estado | `dws-tfstate-642155085958`                                          |

O papel é criado uma vez, com CloudFormation, na conta acima. A trust aceita apenas este repositório e a política anexada é `PowerUserAccess`. O workflow não cria esse papel e não usa access key. Ele chama `aws-actions/configure-aws-credentials` com o ARN lido da variável de repositório `AWS_ROLE_ARN`.

Valor esperado de `AWS_ROLE_ARN`:

```text
arn:aws:iam::642155085958:role/github-dev-workflow-starter-deploy
```

Trust do papel:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::642155085958:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:joaos-moura/dev-workflow-starter:*"
        }
      }
    }
  ]
}
```

O provedor OIDC usa a URL `https://token.actions.githubusercontent.com` e a audiência `sts.amazonaws.com`. Os dois nascem no mesmo CloudFormation do papel.

Cada job que chama `configure-aws-credentials` declara no próprio job `id-token: write` e `contents: read`. O preview também declara `pull-requests: write` para comentar a URL. Não há workflow reutilizável. Nenhum job da AWS usa `environment` nem `pull_request_target`, então o `sub` segue o evento: `repo:joaos-moura/dev-workflow-starter:ref:refs/heads/main` no push da main, e `repo:joaos-moura/dev-workflow-starter:pull_request` no preview. Os dois cabem no `StringLike` acima. A audiência enviada é `sts.amazonaws.com` e a região é `us-east-1`. O papel é lido de `vars.AWS_ROLE_ARN`.

A trust acima não inclui `sts:TagSession`. O workflow define `role-skip-session-tagging: true` para não pedir essa ação. Antes de assumir o papel, o job imprime só as claims `iss`, `aud` e `sub`. O token não entra no log.

### Alerta de US$ 1

Antes do primeiro apply, na conta `642155085958`:

1. Abra Billing and Cost Management → Budgets → Create a budget.
2. Crie um orçamento mensal de custo no valor de 1 USD.
3. Avise por e-mail ao atingir 100%.

Um orçamento cabe na franquia gratuita de budgets da AWS. O alerta existe para a conta Dev não virar surpresa.

### Variável do repositório

Em Settings → Secrets and variables → Actions → Variables, crie:

| Nome           | Valor                                                               |
| -------------- | ------------------------------------------------------------------- |
| `AWS_ROLE_ARN` | `arn:aws:iam::642155085958:role/github-dev-workflow-starter-deploy` |

É variável, não segredo. Sem ela, os workflows `Preview AWS` e `Ambiente dev` imprimem que a AWS está inerte e terminam verdes. Eles não chamam a AWS e não pedem credencial.

Com a variável definida, o job **Bootstrap do estado** roda antes do Terraform. Ele é idempotente: se o bucket `dws-tfstate-642155085958` não existir, o job cria; se existir, segue. Em seguida garante versionamento, criptografia AES256 e bloqueio de acesso público. O bucket de estado permanece privado. O bucket do site, criado pelo Terraform, precisa de leitura pública para o website hosting.

No pull request, o workflow comenta o plan, aplica o workspace do preview e comenta a URL do site e da API. No merge da `main`, aplica o workspace `dev` e publica o site no bucket. Ao fechar o PR, destrói só aquele workspace.

O site no S3 responde em HTTP. A URL da Lambda é HTTPS. O GitHub Pages é HTTPS e não depende da AWS.

## Novo projeto

O workflow `novo-projeto` (Actions → novo-projeto → Run workflow) pede o campo `nome` e cria um repositório público a partir deste template, com o CI e os padrões. Depois protege a `main`: pull request obrigatório e check `CI` verde.

O repositório novo é público de propósito. Proteção de branch em repositório privado não cabe no plano gratuito.

### Marcar como template

Em Settings → General, marque **Template repository**. Sem isso o workflow para com a mensagem de que o repositório ainda não é template.

### Token de acesso

O workflow lê o segredo `NEW_REPO_TOKEN`. Se ele não existir, o job falha com a mensagem de que o segredo não está configurado.

Crie um personal access token **fine-grained**:

1. Em Developer settings → Personal access tokens → Fine-grained tokens, gere um token.
2. Resource owner: a conta dona deste repositório.
3. Repository access: **All repositories**. O repositório novo precisa entrar no alcance do token.
4. Permissions:
   - Administration: Read and write
   - Contents: Read and write
   - Metadata: Read
   - Workflows: Read and write
5. Copie o token.
6. Neste repositório, em Settings → Secrets and variables → Actions → Secrets, crie `NEW_REPO_TOKEN` com esse valor.

O nome do repositório novo usa letras minúsculas, números e hífen.

## Proteção da branch main

A `main` deste repositório deve exigir pull request e o check `CI` verde. O check se chama `CI`, que é o nome do job no workflow de mesmo nome.

## Comandos

```bash
npm run dev
npm test
npm run lint
npm run build
```
