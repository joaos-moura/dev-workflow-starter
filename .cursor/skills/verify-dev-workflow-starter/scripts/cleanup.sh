#!/usr/bin/env bash
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../../../.." && pwd)"
RUN="$RAIZ/.cursor/skills/verify-dev-workflow-starter/.run"

if [[ -f "$RUN/reused" ]]; then
  echo "O preview já existia; cleanup não mata o processo."
  rm -f "$RUN/reused"
  exit 0
fi

if [[ -f "$RUN/preview.pid" ]]; then
  pid="$(cat "$RUN/preview.pid")"
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    wait "$pid" 2>/dev/null || true
    echo "Preview $pid encerrado."
  else
    echo "Pid $pid já não está no ar."
  fi
  rm -f "$RUN/preview.pid"
else
  echo "Nada para encerrar (sem pid deste launch)."
fi
