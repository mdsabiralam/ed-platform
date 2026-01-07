variable "project_id" {
  description = "The ID of the Google Cloud project"
  type        = string
}

variable "region" {
  description = "The region to deploy resources to"
  type        = string
  default     = "us-central1"
}

variable "etl_runner_email" {
  description = "Email of the service account running ETL jobs"
  type        = string
}
