resource "aws_elasticache_subnet_group" "default" {
  name       = "${var.cluster_id}-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "default" {
  replication_group_id          = var.cluster_id
  description                   = "Redis cluster for ${var.cluster_id}"
  node_type                     = "cache.t3.medium"
  port                          = 6379
  parameter_group_name          = "default.redis7"
  automatic_failover_enabled    = true
  num_node_groups               = 1
  replicas_per_node_group       = 1
  subnet_group_name             = aws_elasticache_subnet_group.default.name
  security_group_ids            = var.security_group_ids
}

variable "cluster_id" {}
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
