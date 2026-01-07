# Minimal EKS Module for demonstration
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = var.role_arn

  vpc_config {
    subnet_ids = var.subnet_ids
  }
}

variable "cluster_name" {}
variable "role_arn" {}
variable "subnet_ids" { type = list(string) }
