#!/usr/bin/env bash
# Imprime iss, aud e sub do token OIDC. O token em si não sai no log.
set -euo pipefail

if [[ -z "${ACTIONS_ID_TOKEN_REQUEST_TOKEN:-}" || -z "${ACTIONS_ID_TOKEN_REQUEST_URL:-}" ]]; then
  echo "Token OIDC indisponível. O job precisa de permissions id-token: write." >&2
  exit 1
fi

python3 - <<'PY'
import base64
import json
import os
import urllib.request

url = os.environ["ACTIONS_ID_TOKEN_REQUEST_URL"] + "&audience=sts.amazonaws.com"
pedido = urllib.request.Request(
    url,
    headers={"Authorization": "bearer " + os.environ["ACTIONS_ID_TOKEN_REQUEST_TOKEN"]},
)
with urllib.request.urlopen(pedido) as resposta:
    corpo = json.load(resposta)

token = corpo["value"]
del corpo
partes = token.split(".")
del token
if len(partes) < 2:
    raise SystemExit("Payload do token OIDC inválido.")

payload = partes[1]
del partes
dados = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
del payload
faltando = [nome for nome in ("iss", "aud", "sub") if dados.get(nome) in (None, "")]
if faltando:
    raise SystemExit("Claims ausentes: " + ", ".join(faltando))

print(json.dumps({nome: dados[nome] for nome in ("iss", "aud", "sub")}, ensure_ascii=False))
PY
