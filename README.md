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
- Formulário do Backstage para abrir o repositório sem mexer nas ferramentas. O passo a passo local está em [docs/backstage.md](docs/backstage.md).

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

O papel é criado uma vez, com CloudFormation, na conta acima. A política anexada é `PowerUserAccess`. O workflow não cria esse papel e não usa access key. Ele chama `aws-actions/configure-aws-credentials` com o ARN lido da variável de repositório `AWS_ROLE_ARN`.

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
          "token.actions.githubusercontent.com:sub": [
            "repo:joaos-moura/*:*",
            "repo:joaos-moura@238336062/*:*"
          ]
        }
      }
    }
  ]
}
```

O provedor OIDC usa a URL `https://token.actions.githubusercontent.com` e a audiência `sts.amazonaws.com`. Os dois nascem no mesmo CloudFormation do papel.

Cada job que chama `configure-aws-credentials` declara no próprio job `id-token: write` e `contents: read`. O preview também declara `pull-requests: write` para comentar a URL. Nenhum job que assume o papel usa `environment` nem `pull_request_target`. A audiência enviada é `sts.amazonaws.com` e a região é `us-east-1`. O papel é lido de `vars.AWS_ROLE_ARN`.

A trust acima não inclui `sts:TagSession`. O workflow define `role-skip-session-tagging: true` para não pedir essa ação.

O repositório emite o subject imutável (`use_immutable_subject: true`), no formato `repo:joaos-moura@238336062/dev-workflow-starter@1416112642:pull_request` ou com `ref:refs/heads/main`. A trust aceita o formato com o nome e o formato imutável para qualquer repositório da conta `joaos-moura`. O workflow não altera o subject.

A trust foi atualizada na stack `github-oidc-demo`. Um repositório criado pelo Backstage recebe a mesma variável `AWS_ROLE_ARN` e assume esse papel. A alternativa mais restritiva, um papel por repositório, está em [docs/backstage.md](docs/backstage.md). Este repositório não altera a AWS.

O passo que imprime `iss`, `aud` e `sub` só roda quando a variável `DEBUG_OIDC` vale `true`. Sem ela, o passo fica de fora. O token não entra no log.

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

É variável, não segredo. Sem ela, os jobs **Preview PR** e **CD Dev** imprimem que a AWS está inerte e terminam verdes. Eles não chamam a AWS e não pedem credencial.

Com a variável definida, o job garante o bucket de estado antes do Terraform. Ele é idempotente: se o bucket `dws-tfstate-642155085958` não existir, o job cria; se existir, segue. Em seguida garante versionamento, criptografia AES256 e bloqueio de acesso público. O bucket de estado permanece privado. O bucket do site, criado pelo Terraform, precisa de leitura pública para o website hosting.

No pull request, o job **Preview PR** comenta o plan, aplica o workspace do preview e comenta a URL do site e da API. No push da `main`, o job **CD Dev** aplica o workspace `dev` e publica o site no bucket. Ao fechar o PR, o mesmo job **Preview PR** destrói só aquele workspace.

## Pipeline

O workflow `Pipeline` encadeia os estágios com `needs`, nesta ordem:

1. Detecção de tecnologia
2. Gates de segurança (CodeQL, Dependabot, secret scan, reviewdog)
3. Testes e cobertura
4. Build e scan
5. Preview PR
6. CD Dev
7. CD HML
8. Perf HML
9. CD PRD

O secret scan usa o gitleaks. CodeQL, Dependabot e o reviewdog rodam no mesmo gate. Os workflows `CI`, `CodeQL` e `reviewdog` continuam separados, com os mesmos nomes de check.

Push para o ECR, Datadog APM e os deploys reais de HML e PRD ficam simulados e marcados como **na versão empresa**. CD HML e Perf HML usam o ambiente `hml`. CD PRD usa o ambiente `prd`. A aprovação manual é a proteção desses ambientes. O revisor esperado é `@joaos-moura`, o mesmo do CODEOWNERS. Sem permissão para gravar a proteção, o ambiente nasce sem revisor.

CD HML, Perf HML e CD PRD só rodam no push da `main`, e só se o job anterior passou. No pull request esses três ficam skipped. O check exigido na `main` continua sendo `CI`, que é outro workflow. Um job skipped não falha o Pipeline e não entra no lugar desse check.

O workflow não tem grupo de concorrência. Um **CD HML** esperando aprovação não segura o CI nem o **CD Dev** do push seguinte.

No pull request, detecção, gates, testes e build compartilham `pipeline-ci-<ref>` e a execução nova cancela a anterior. Na `main`, cada execução desses jobs usa o próprio `run_id`, então todas rodam. O workflow `CI` segue em `ci-${{ github.ref }}` e o Pages em `pages`.

Preview e destroy usam `preview-<número do PR>`, sem cancelar a execução em andamento, para o Terraform do mesmo preview não correr junto. Outro preview que ainda esteja só na fila cede o lugar ao mais novo.

**CD Dev** usa `deploy-dev-<ref>` com `queue: max`: os applies entram na ordem, até cem, e não se cancelam. **CD HML** e **Perf HML** compartilham `deploy-hml-<ref>`. **CD PRD** usa `deploy-prd-<ref>`. Nos dois, `cancel-in-progress` é false. A aprovação que já está na tela continua. Um HML ou PRD mais novo, ainda só na fila, substitui o anterior que também só esperava. CI e **CD Dev** não entram nesses grupos.

O mesmo workflow aceita `workflow_dispatch` na `main`. O template do Backstage usa esse disparo. O CD Dev aplica no push e nesse disparo. CD HML, Perf HML e CD PRD não rodam no disparo.

O site no S3 responde em HTTP. A URL da Lambda é HTTPS. O GitHub Pages é HTTPS e não depende da AWS.

## Backstage

O dev abre o serviço pelo Software Template `novo-servico`, na app local do Backstage. O formulário pede nome, descrição e owner, publica o repositório com o pipeline, grava `AWS_ROLE_ARN` e dispara o workflow em segundo plano. Não há portal hospedado. O token do GitHub fica em `app-config.local.yaml` ou na variável `GITHUB_TOKEN`, e não entra no git.

O passo a passo está em [docs/backstage.md](docs/backstage.md).

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
