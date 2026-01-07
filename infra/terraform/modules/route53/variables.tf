variable "hosted_zone_id" {
  description = "Route53 Hosted Zone ID"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the record"
  type        = string
}

variable "primary_fqdn" {
  description = "Fully Qualified Domain Name for health check"
  type        = string
}

variable "primary_lb_ip" {
  description = "IP address of the primary load balancer"
  type        = string
}

variable "secondary_target_dns_name" {
  description = "DNS name of the secondary target (e.g., CloudFront distribution or DR LB)"
  type        = string
}

variable "secondary_target_zone_id" {
  description = "Zone ID of the secondary target"
  type        = string
}
