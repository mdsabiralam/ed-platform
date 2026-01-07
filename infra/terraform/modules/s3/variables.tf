variable "bucket_name" {
  description = "The name of the primary S3 bucket"
  type        = string
  default     = "ed-secure-docs"
}

variable "destination_bucket_arn" {
  description = "The ARN of the destination bucket for replication"
  type        = string
}
