# Configuração parcial. O workflow aponta para o bucket dws-tfstate-642155085958
# em us-east-1 e cria esse bucket, se faltar, antes do init. O lock usa use_lockfile.
terraform {
  backend "s3" {}
}
