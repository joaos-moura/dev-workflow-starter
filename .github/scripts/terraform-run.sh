#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "::error::Uso: terraform-run.sh <plan|apply|destroy> <workspace>"
  exit 1
fi

comando="$1"
workspace="$2"

case "$comando" in
  plan | apply | destroy) ;;
  *)
    echo "::error::Comando Terraform desconhecido: ${comando}."
    exit 1
    ;;
esac

if [[ ! "$workspace" =~ ^(dev|pr-[1-9][0-9]*)$ ]]; then
  echo "::error::Workspace inválido: ${workspace}. Use dev ou pr-<número>."
  exit 1
fi

# Bucket e região da demonstração. O job de bootstrap cria o bucket se ele faltar.
TF_STATE_BUCKET="dws-tfstate-642155085958"
regiao="us-east-1"
export AWS_REGION="$regiao"
export AWS_DEFAULT_REGION="$regiao"

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${raiz}/infra"

terraform init -input=false -reconfigure \
  -backend-config="bucket=${TF_STATE_BUCKET}" \
  -backend-config="key=dev-workflow-starter/terraform.tfstate" \
  -backend-config="region=${regiao}" \
  -backend-config="encrypt=true" \
  -backend-config="use_lockfile=true"

if terraform workspace list -no-color | sed 's/^[*[:space:]]*//' | grep -qx "${workspace}"; then
  terraform workspace select -no-color "${workspace}"
else
  if [[ "$comando" == "destroy" ]]; then
    echo "O workspace ${workspace} não existe. Nada a destruir."
    exit 0
  fi
  terraform workspace new -no-color "${workspace}"
fi

variaveis=(-var="environment=${workspace}" -var="aws_region=${regiao}")

case "$comando" in
  plan)
    terraform plan -input=false -no-color -lock-timeout=120s "${variaveis[@]}" -out=tfplan | tee plan.txt
    ;;
  apply)
    if [[ -f tfplan ]]; then
      terraform apply -input=false -auto-approve -lock-timeout=120s tfplan
    else
      terraform apply -input=false -auto-approve -lock-timeout=120s "${variaveis[@]}"
    fi
    ;;
  destroy)
    terraform destroy -input=false -auto-approve -lock-timeout=120s "${variaveis[@]}"
    terraform workspace select -no-color default
    terraform workspace delete -no-color "${workspace}"
    ;;
esac
