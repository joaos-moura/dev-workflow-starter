provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.conta_dev]

  default_tags {
    tags = {
      Projeto    = "dev-workflow-starter"
      Ambiente   = var.environment
      Gerenciado = "terraform"
    }
  }
}
