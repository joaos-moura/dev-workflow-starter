#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${NEW_REPO_TOKEN:-}" ]]; then
  echo "::error::O segredo NEW_REPO_TOKEN não está configurado. Crie um personal access token fine-grained (o passo a passo está no README, na seção Token de acesso) e salve-o em Settings → Secrets and variables → Actions, com o nome NEW_REPO_TOKEN."
  exit 1
fi

if [[ -z "${NOME:-}" ]]; then
  echo "::error::Informe o nome do repositório no campo nome."
  exit 1
fi

if [[ -z "${GITHUB_TOKEN:-}" || -z "${GITHUB_REPOSITORY:-}" ]]; then
  echo "::error::GITHUB_TOKEN ou GITHUB_REPOSITORY ausente. Rode este script pelo workflow novo-projeto."
  exit 1
fi

if ! [[ "$NOME" =~ ^[a-z0-9]([a-z0-9-]{0,98}[a-z0-9])?$ ]]; then
  echo "::error::O nome deve usar letras minúsculas, números e hífen, sem começar ou terminar com hífen."
  exit 1
fi

api() {
  local metodo="$1"
  local url="$2"
  local token="$3"
  local arquivo="$4"
  local corpo="${5:-}"
  local args=(
    -sS
    -o "$arquivo"
    -w "%{http_code}"
    -X "$metodo"
    -H "Authorization: Bearer ${token}"
    -H "Accept: application/vnd.github+json"
    -H "X-GitHub-Api-Version: 2022-11-28"
    -H "User-Agent: dev-workflow-starter"
  )

  if [[ -n "$corpo" ]]; then
    args+=(-H "Content-Type: application/json" --data-binary "$corpo")
  fi

  curl "${args[@]}" "$url"
}

codigo="$(api GET "https://api.github.com/repos/${GITHUB_REPOSITORY}" "$GITHUB_TOKEN" /tmp/modelo.json)"
if [[ "$codigo" != "200" ]]; then
  echo "::error::Não foi possível ler este repositório para saber se ele é um template. A API respondeu ${codigo}."
  cat /tmp/modelo.json
  exit 1
fi

if [[ "$(jq -r '.is_template' /tmp/modelo.json)" != "true" ]]; then
  echo "::error::Este repositório ainda não está marcado como template. Em Settings → General, marque Template repository. Sem isso a API não gera um repositório novo."
  exit 1
fi

codigo="$(api GET "https://api.github.com/user" "$NEW_REPO_TOKEN" /tmp/usuario.json)"
owner="$(jq -r '.login // empty' /tmp/usuario.json)"
if [[ "$codigo" != "200" || ! "$owner" =~ ^[A-Za-z0-9-]+$ ]]; then
  echo "::error::O NEW_REPO_TOKEN não identificou a conta que vai receber o repositório. Confira as permissões na seção Token de acesso do README."
  exit 1
fi

corpo="$(jq -n --arg owner "$owner" --arg name "$NOME" '{
  owner: $owner,
  name: $name,
  private: false,
  include_all_branches: false,
  description: "Serviço criado a partir do template dev-workflow-starter."
}')"

codigo="$(api POST "https://api.github.com/repos/${GITHUB_REPOSITORY}/generate" "$NEW_REPO_TOKEN" /tmp/novo-repo.json "$corpo")"
if [[ "$codigo" != "201" ]]; then
  mensagem="$(jq -r '.message // "sem detalhe"' /tmp/novo-repo.json)"
  echo "::error::Não foi possível criar o repositório ${owner}/${NOME}. A API respondeu ${codigo}: ${mensagem}"
  exit 1
fi

echo "Repositório ${owner}/${NOME} criado."

pronta="false"
for _ in 1 2 3 4 5 6; do
  codigo="$(api GET "https://api.github.com/repos/${owner}/${NOME}/branches/main" "$NEW_REPO_TOKEN" /tmp/branch.json)"
  if [[ "$codigo" == "200" ]]; then
    pronta="true"
    break
  fi
  sleep 3
done

if [[ "$pronta" != "true" ]]; then
  echo "::error::O repositório ${owner}/${NOME} foi criado, mas a branch main ainda não apareceu para receber a proteção."
  exit 1
fi

jq -n '{
  required_status_checks: { strict: true, contexts: ["CI"] },
  enforce_admins: false,
  required_pull_request_reviews: {
    dismiss_stale_reviews: false,
    require_code_owner_reviews: false,
    required_approving_review_count: 0
  },
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false,
  required_conversation_resolution: false
}' > /tmp/protecao.json

protegida="false"
for _ in 1 2 3 4 5; do
  codigo="$(api PUT "https://api.github.com/repos/${owner}/${NOME}/branches/main/protection" "$NEW_REPO_TOKEN" /tmp/protecao-resposta.json "$(cat /tmp/protecao.json)")"
  if [[ "$codigo" == "200" ]]; then
    protegida="true"
    break
  fi
  sleep 3
done

if [[ "$protegida" != "true" ]]; then
  mensagem="$(jq -r '.message // "sem detalhe"' /tmp/protecao-resposta.json)"
  echo "::error::O repositório ${owner}/${NOME} foi criado, mas a proteção da branch main falhou. A API respondeu ${codigo}: ${mensagem}"
  exit 1
fi

echo "Branch main protegida: pull request obrigatório e check CI verde."
