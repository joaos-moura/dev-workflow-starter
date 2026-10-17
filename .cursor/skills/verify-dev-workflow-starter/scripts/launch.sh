#!/usr/bin/env bash
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$RAIZ"
PORTA="${PORTA:-4173}"
URL="http://127.0.0.1:${PORTA}/dev-workflow-starter/"
RUN=".cursor/skills/verify-dev-workflow-starter/.run"
mkdir -p "$RUN"

if curl -sf "$URL" | grep -q "dev-workflow-starter"; then
  echo reused >"$RUN/reused"
  echo "$URL" >"$RUN/url"
  echo "Preview já no ar em $URL (não vou matar no cleanup)."
  exit 0
fi

npm run build
rm -f "$RUN/reused"
npx vite preview --host 127.0.0.1 --port "$PORTA" --strictPort >"$RUN/preview.log" 2>&1 &
echo $! >"$RUN/preview.pid"

for _ in $(seq 1 40); do
  if curl -sf "$URL" | grep -q "dev-workflow-starter"; then
    echo "$URL" >"$RUN/url"
    echo "Pronto: $URL (pid $(cat "$RUN/preview.pid"))."
    exit 0
  fi
  sleep 0.25
done

echo "Preview não respondeu. Log:" >&2
cat "$RUN/preview.log" >&2
exit 1
