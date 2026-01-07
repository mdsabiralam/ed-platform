# Backend configuration to use S3 and DynamoDB for state locking.
# Note: The bucket and table must exist before running 'terraform init'.

terraform {
  backend "s3" {
    bucket         = "ed-terraform-state"
    key            = "global/s3/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "ed-terraform-locks"
    encrypt        = true
  }
}
