variable "environment" {
  description = "Ambiente isolado: dev ou pr-<número>."
  type        = string

  validation {
    condition     = can(regex("^(dev|pr-[1-9][0-9]*)$", var.environment))
    error_message = "O ambiente deve ser dev ou pr-<número>."
  }
}

variable "aws_region" {
  description = "Região da conta Dev. A demonstração usa us-east-1."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = var.aws_region == "us-east-1"
    error_message = "A demonstração usa a região us-east-1."
  }
}

variable "conta_dev" {
  description = "Conta Dev da demonstração."
  type        = string
  default     = "642155085958"

  validation {
    condition     = var.conta_dev == "642155085958"
    error_message = "A demonstração usa somente a conta 642155085958."
  }
}
