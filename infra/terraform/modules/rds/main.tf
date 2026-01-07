terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0.0"
      configuration_aliases = [ aws.primary, aws.replica ]
    }
  }
}

resource "aws_db_instance" "default" {
  provider               = aws.primary
  allocated_storage      = 20
  storage_type           = "gp3"
  engine                 = "postgres"
  engine_version         = "14.7"
  instance_class         = "db.t3.medium"
  identifier             = var.identifier
  username               = var.username
  password               = var.password
  parameter_group_name   = "default.postgres14"
  skip_final_snapshot    = true # Set to false in prod
  publicly_accessible    = false
  vpc_security_group_ids = var.vpc_security_group_ids
  db_subnet_group_name   = var.db_subnet_group_name

  # RPO Configuration (13.G.01)
  # Automated backups enable point-in-time recovery.
  # Transaction logs (WAL) are uploaded to S3 every 5 minutes.
  backup_retention_period = 35
  copy_tags_to_snapshot   = true

  # Encryption
  storage_encrypted = true
  kms_key_id        = var.kms_key_id

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Cross-Region Automated Backups Replication (13.G.04)
resource "aws_db_instance_automated_backups_replication" "default" {
  provider               = aws.replica
  source_db_instance_arn = aws_db_instance.default.arn
  retention_period       = 35
}
