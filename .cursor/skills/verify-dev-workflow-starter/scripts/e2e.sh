#!/usr/bin/env bash
set -euo pipefail
cd "$(cd "$(dirname "$0")/../../../.." && pwd)"
exec npm run test:e2e -- "$@"
