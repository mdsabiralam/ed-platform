# Minimal VPC Module
resource "aws_vpc" "main" {
  cidr_block = var.cidr_block
  tags = {
    Name = var.name
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.cidr_block, 8, count.index)
  availability_zone = "${var.region}a" # Simplified for demo

  tags = {
    Name = "${var.name}-private-${count.index}"
  }
}

variable "cidr_block" {}
variable "name" {}
variable "region" {
  default = "ap-south-1"
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_ids" {
  value = aws_subnet.private[*].id
}
