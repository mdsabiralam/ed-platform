terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
  alias  = "primary"
}

provider "aws" {
  region = "ap-southeast-1"
  alias  = "replica"
}

variable "is_dr_active" {
  description = "Set to true to provision DR infrastructure (Cold Standby)"
  type        = bool
  default     = false
}

variable "domain_name" {
  default = "ed-platform.com"
}

# --- PRIMARY REGION RESOURCES ---

module "vpc_primary" {
  source = "./modules/vpc"
  providers = { aws = aws.primary }
  cidr_block = "10.0.0.0/16"
  name       = "ed-platform-primary"
  region     = "ap-south-1"
}

# S3 DR Backup Bucket (Destination)
resource "aws_s3_bucket" "dr_backup" {
  provider = aws.replica
  bucket   = "ed-secure-docs-dr-backup-${random_id.suffix.hex}"

  # Ensure versioning is on for replication target
  versioning {
    enabled = true
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}

module "s3_primary" {
  source = "./modules/s3"
  providers = {
    aws.primary = aws.primary
  }
  bucket_name            = "ed-secure-docs-primary"
  destination_bucket_arn = aws_s3_bucket.dr_backup.arn
}

module "rds_primary" {
  source = "./modules/rds"
  providers = {
    aws.primary = aws.primary
    aws.replica = aws.replica
  }

  identifier             = "ed-platform-db"
  password               = "ChangeMeInProd"
  vpc_security_group_ids = [] # Would link to SGs from VPC
  db_subnet_group_name   = "default" # Simplified
  environment            = "production"
  kms_key_id             = "alias/aws/rds"
}

# --- MAINTENANCE & FAILOVER ---

module "maintenance" {
  source = "./modules/maintenance"
  providers = { aws = aws.primary }
  domain_name = var.domain_name
}

module "route53" {
  source = "./modules/route53"
  providers = { aws = aws.primary }

  hosted_zone_id            = "Z1234567890"
  domain_name               = var.domain_name
  primary_fqdn              = "api.ed-platform.com"
  primary_lb_ip             = "1.2.3.4"
  secondary_target_dns_name = module.maintenance.cloudfront_domain_name
  secondary_target_zone_id  = module.maintenance.cloudfront_hosted_zone_id
}

# --- DR REGION RESOURCES (COLD STANDBY) ---

module "vpc_dr" {
  source = "./modules/vpc"
  providers = { aws = aws.replica }
  count     = var.is_dr_active ? 1 : 0

  cidr_block = "10.1.0.0/16"
  name       = "ed-platform-dr"
  region     = "ap-southeast-1"
}

module "eks_dr" {
  source = "./modules/eks"
  providers = { aws = aws.replica }
  count     = var.is_dr_active ? 1 : 0

  cluster_name = "ed-platform-dr-cluster"
  role_arn     = "arn:aws:iam::123456789012:role/EksClusterRole"
  subnet_ids   = module.vpc_dr[0].subnet_ids
}

module "redis_dr" {
  source = "./modules/redis"
  providers = { aws = aws.replica }
  count     = var.is_dr_active ? 1 : 0

  cluster_id         = "ed-platform-dr-redis"
  subnet_ids         = module.vpc_dr[0].subnet_ids
  security_group_ids = [] # Simplified
}
