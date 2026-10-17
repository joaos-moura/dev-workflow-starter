#!/usr/bin/env bash
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../../../.." && pwd)"
RUN="$RAIZ/.cursor/skills/verify-dev-workflow-starter/.run"

if [[ -f "$RUN/reused" ]]; then
  echo "O preview já existia; cleanup não mata o processo."
  rm -f "$RUN/reused"
  exit 0
fi

matar_arvore() {
  local pid="$1"
  local filho
  for filho in $(pgrep -P "$pid" 2>/dev/null || true); do
    matar_arvore "$filho"
  done
  kill "$pid" 2>/dev/null || true
}

if [[ -f "$RUN/preview.pid" ]]; then
  pid="$(cat "$RUN/preview.pid")"
  matar_arvore "$pid"
  wait "$pid" 2>/dev/null || true
  # npx deixa o `node … vite preview` órfão; mata o que ficou na porta deste launch.
  pgrep -f "vite preview --host 127.0.0.1 --port 4173" | while read -r extra; do
    kill "$extra" 2>/dev/null || true
  done
  echo "Preview $pid encerrado."
  rm -f "$RUN/preview.pid"
else
  echo "Nada para encerrar (sem pid deste launch)."
fi
