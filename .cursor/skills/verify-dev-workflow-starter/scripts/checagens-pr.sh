#!/usr/bin/env bash
# Só leitura. Nunca aprova environment nem faz merge.
set -euo pipefail
PR="${1:-}"
if [[ -z "$PR" ]]; then
  echo "uso: checagens-pr.sh <número-ou-url-do-pr>" >&2
  exit 2
fi

echo "=== gh pr view (draft, head, mergeState) ==="
gh pr view "$PR" --json isDraft,state,headRefOid,mergeable,statusCheckRollup \
  --jq '{draft:.isDraft,state,head:.headRefOid[0:7],mergeable}'

echo
echo "=== gh pr checks ==="
gh pr checks "$PR" || true

echo
echo "Num PR, os jobs CD HML, Perf HML e CD PRD precisam aparecer skipped."
echo "Não rode gh pr review --approve em environment, nem gh pr merge."
