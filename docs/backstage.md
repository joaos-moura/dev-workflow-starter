# Backstage

A porta de entrada do dev é um Software Template local. O formulário pede nome, descrição e owner. O dev não abre a AWS, não cria papel e não edita o workflow.

Não há portal hospedado e não há custo. A app sobe na máquina ou no devcontainer com `npx @backstage/create-app@latest`.

## O que o formulário faz

O template está em `backstage/templates/novo-servico/template.yaml`. Os passos usam ações padrão:

1. `fetch:plain` copia a árvore da branch `main` deste repositório, sem Nunjucks. Os workflows usam `${{ }}`. Passar esses arquivos por `fetch:template` quebraria as expressões do GitHub Actions. O arquivo compactado do GitHub também traz um diretório raiz a mais. A URL de árvore entrega os arquivos na raiz do workspace.
2. `fetch:template` roda só em `skeleton/` e grava o `catalog-info.yaml` do serviço. A descrição passa pelo filtro `dump` para aspas não quebrarem o YAML.
3. `publish:github` cria o repositório público `joaos-moura/<nome>`, envia os arquivos e grava a variável `AWS_ROLE_ARN`. Essa ação já aceita `repoVariables`. `github:repo:create` também aceita a variável, mas cria o repositório vazio e não publica a árvore. Não há passo customizado.
4. `github:actions:dispatch` dispara `.github/workflows/pipeline.yml` na branch `main`.
5. `catalog:register` registra o `/catalog-info.yaml` com a URL que o `publish:github` devolve.

O valor gravado em `AWS_ROLE_ARN` é fixo:

```text
arn:aws:iam::642155085958:role/github-dev-workflow-starter-deploy
```

`protectDefaultBranch` fica `false`. O padrão da ação é `true`, e uma falha ao proteger a branch aborta o formulário depois que o repositório já existe. A proteção da `main` continua o passo separado descrito no README. O repositório nasce público: proteção de branch em repositório privado não cabe no plano gratuito.

A cópia usa a árvore da `main`, não a API de generate. A marca **Template repository** só é necessária para o workflow `novo-projeto`.

O push da `main`, feito pelo `publish:github`, também inicia o Pipeline. O job **CD Dev** aplica o workspace `dev` nesse push e de novo no `workflow_dispatch`. O grupo de concorrência `pipeline-refs/heads/main` segura a segunda execução. O apply é idempotente. Se o GitHub ainda não indexou o workflow no momento do disparo, a execução do push continua sendo o bootstrap.

**CD HML** para em _Waiting for review_ quando o ambiente `hml` tem revisor. Este template não aprova deploy.

O conteúdo copiado é a `main` no momento do formulário. O disparo encontra `workflow_dispatch` depois que esta mudança está na `main`.

## Rodar localmente

```bash
npx @backstage/create-app@latest
```

O comando pede um nome. Crie a app fora deste repositório. Se ela ficar aqui dentro, use a pasta `backstage-local/`, que está no `.gitignore`.

Na app local:

```bash
yarn --cwd packages/backend add @backstage/plugin-scaffolder-backend-module-github
yarn start
```

Abra `http://localhost:3000/create/actions` e confira `fetch:plain`, `fetch:template`, `publish:github`, `github:actions:dispatch` e `catalog:register`.

O `create-app` recente pode já trazer o módulo do GitHub. Se `publish:github` e `github:actions:dispatch` aparecerem na lista, o `yarn add` não muda nada. Se o backend ainda não registra o módulo, acrescente em `packages/backend/src/index.ts`:

```ts
backend.add(import("@backstage/plugin-scaffolder-backend-module-github"));
```

## Devcontainer

O devcontainer deste repositório é a imagem Node 22. Rode o mesmo `npx @backstage/create-app@latest` dentro dele. As portas `3000` e `7007` estão encaminhadas junto da `5173`. O `postCreate` não instala o Backstage.

## Token

O token fica na app local. Este repositório não o versiona.

No `app-config.local.yaml` da app (o `create-app` já deixa esse arquivo de fora do git):

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

Exporte `GITHUB_TOKEN` no ambiente, ou cole o valor só nesse arquivo local. O exemplo versionado está em `backstage/app-config.local.yaml.example` e aponta para a variável, sem segredo. `app-config.local.yaml` também está no `.gitignore` deste repositório, para o caso de alguém salvar o arquivo aqui.

Token fine-grained, com a conta dona como resource owner e acesso a todos os repositórios, porque o repositório novo precisa entrar no alcance:

- Administration: Read and write
- Contents: Read and write
- Metadata: Read
- Workflows: Read and write
- Actions: Read and write
- Variables: Read and write, quando a tela do token separar as variáveis de Actions

## Registrar o template

No `app-config.yaml` da app local, sem segredo:

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/joaos-moura/dev-workflow-starter/blob/main/backstage/templates/novo-servico/template.yaml
      rules:
        - allow: [Template]
    - type: url
      target: https://github.com/joaos-moura/dev-workflow-starter/blob/main/catalog-info.yaml
      rules:
        - allow: [Component, Group]
```

Antes do merge, troque `main` pela branch do pull request. Reinicie a app. O template aparece em Create.

O owner padrão do formulário é `group:default/time`, o Group do `catalog-info.yaml` deste repositório. Outro owner precisa ser uma entidade que já exista no catálogo.

## Papel OIDC nos repositórios novos

A trust de hoje aceita só este repositório, nos dois formatos de subject:

- `repo:joaos-moura/dev-workflow-starter:*`
- `repo:joaos-moura@238336062/dev-workflow-starter@1416112642:*`

O formulário grava em todo repositório novo o mesmo ARN. Este repositório não altera a trust, o papel nem a conta. Com a trust atual, o **CD Dev** do repositório novo chama `AssumeRoleWithWebIdentity` e a AWS recusa, porque o subject não é o deste repositório. Há duas saídas. As duas ficam fora deste template.

### Opção A — curinga do dono

Incluir na mesma trust, além dos dois subjects deste repositório:

- `repo:joaos-moura/*:*`
- `repo:joaos-moura@238336062/*:*`

O segundo cobre o subject imutável, no formato `repo:joaos-moura@238336062/<repo>@<id>:<contexto>`. O primeiro cobre o formato só com o nome, se algum repositório emitir assim.

Prós: um papel serve para o repositório novo. O ARN gravado pelo formulário continua válido. Não nasce papel por serviço.

Contras: qualquer repositório da conta `joaos-moura` pode assumir o papel, e a política anexada é `PowerUserAccess`. O curinga imutável amarra o id da conta, não o id do repositório.

### Opção B — um papel por repositório

Criar um papel cujo nome siga o prefixo permitido e uma trust só daquele repositório, de novo nos dois formatos:

- `repo:joaos-moura/<nome>:*`
- `repo:joaos-moura@238336062/<nome>@<id-do-repositorio>:*`

O id do repositório só existe depois da criação.

Prós: o alcance fica no repositório. O subject imutável entra com o id daquele repo.

Contras: o papel nasce fora deste template. O formulário não pergunta o ARN e grava o papel deste starter. Quem escolher esta opção troca a variável `AWS_ROLE_ARN` do repositório novo depois, ou o primeiro **CD Dev** falha no AssumeRole.

## Validação

`npm run validar:backstage` confere o template, o skeleton, o `catalog-info.yaml` deste repositório e o `workflow_dispatch` do pipeline. O CI roda o mesmo comando.
