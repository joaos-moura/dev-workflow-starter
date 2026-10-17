#!/usr/bin/env bash
# Camada 2 da pirâmide: lint, testes, invariantes, build e e2e.
set -euo pipefail
cd "$(cd "$(dirname "$0")/../../../.." && pwd)"
npm run lint
npm test
npm run validar:invariantes
npm run build
npm run test:e2e
echo "verificar.sh: lint, testes, pipeline, build e e2e ok."
