#!/usr/bin/env bash
set -euo pipefail

BUCKET="dws-tfstate-642155085958"
REGIAO="us-east-1"

if aws s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
  echo "O bucket de estado ${BUCKET} já existe."
else
  echo "Criando o bucket de estado ${BUCKET} em ${REGIAO}."
  set +e
  saida="$(aws s3api create-bucket --bucket "$BUCKET" --region "$REGIAO" 2>&1)"
  codigo=$?
  set -e
  if [[ "$codigo" -ne 0 ]]; then
    if grep -q "BucketAlreadyOwnedByYou" <<<"$saida"; then
      echo "O bucket de estado já pertence a esta conta."
    else
      echo "::error::Não foi possível criar o bucket de estado ${BUCKET}. ${saida}"
      exit 1
    fi
  fi
fi

aws s3api put-bucket-versioning \
  --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket "$BUCKET" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'

aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

echo "Bucket de estado pronto: versionamento, criptografia e bloqueio de acesso público. O lock do Terraform usa use_lockfile."
