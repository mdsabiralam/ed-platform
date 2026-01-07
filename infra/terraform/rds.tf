module "db" {
  source = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "ed-platform-db"

  engine               = "postgres"
  engine_version       = "14"
  family               = "postgres14"
  major_engine_version = "14"
  instance_class       = "db.t3.medium"

  allocated_storage     = 20
  max_allocated_storage = 1000 # Storage Autoscaling up to 1TB

  db_name  = "ed_platform"
  username = local.db_creds.username
  password = local.db_creds.password
  port     = 5432

  multi_az               = local.is_production # Enable Multi-AZ for HA (in production)
  vpc_security_group_ids = [module.security_group_db.security_group_id] # Assuming a SG module or resource is created

  subnet_ids = module.vpc.private_subnets

  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"

  # Enhanced Monitoring
  monitoring_interval = "30"
  monitoring_role_name = "MyRDSMonitoringRole"
  create_monitoring_role = true

  tags = {
    Owner       = "EdPlatform"
    Environment = local.environment
  }
}

# Simple security group for DB (referenced above)
module "security_group_db" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "ed-db-sg"
  description = "PostgreSQL security group"
  vpc_id      = module.vpc.vpc_id

  # Ingress rule & CIDR blocks
  ingress_with_cidr_blocks = [
    {
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      description = "PostgreSQL access from within VPC"
      cidr_blocks = module.vpc.vpc_cidr_block
    },
  ]
}
