# Como contribuir

O texto deste repositório e do site é público. Escreva sobre o time ou sobre uma empresa de médio porte. Não inclua nome de empresa, nome de repositório interno, nome de pessoa nem domínio que identifique uma empresa.

## Fluxo de branch

1. Atualize a `main`.
2. Crie uma branch `tipo/resumo-curto`, por exemplo `feat/health-da-api`.
3. Faça commits no padrão Conventional Commits.
4. Abra um pull request.
5. Espere o check `CI` ficar verde.
6. O merge na `main` publica o GitHub Pages. Se a variável `AWS_ROLE_ARN` existir, também aplica o ambiente dev.
7. Ao fechar o pull request, o preview daquele PR é destruído.

A `main` deve exigir pull request e o check `CI` verde.

## Conventional Commits

O título do commit usa um tipo, dois-pontos e um resumo no imperativo, em minúsculas:

- `feat:` funcionalidade
- `fix:` correção
- `docs:` documentação
- `test:` teste
- `ci:` pipeline
- `chore:` manutenção
- `refactor:` mudança interna sem mudar o comportamento

Exemplo: `feat: mostra o health da API na arquitetura`

## Antes de abrir o pull request

```bash
npm run lint
npm test
npm run build
terraform -chdir=infra fmt -check -recursive
terraform -chdir=infra init -backend=false
terraform -chdir=infra validate
```

O devcontainer já traz Node 22 e Terraform 1.16.5, os mesmos do CI.
