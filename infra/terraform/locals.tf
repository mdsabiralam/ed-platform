locals {
  environment = terraform.workspace == "default" ? "staging" : terraform.workspace

  is_production = local.environment == "production"

  db_creds = jsondecode(
    data.aws_secretsmanager_secret_version.db_credentials.secret_string
  )
}
