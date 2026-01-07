resource "aws_s3_bucket" "secure_docs" {
  bucket = "ed-secure-docs"

  tags = {
    Environment = local.environment
    Name        = "ed-secure-docs"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "secure_docs" {
  bucket = aws_s3_bucket.secure_docs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "secure_docs" {
  bucket = aws_s3_bucket.secure_docs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "public_waas" {
  bucket = "ed-public-waas"

  tags = {
    Environment = local.environment
    Name        = "ed-public-waas"
  }
}

resource "aws_s3_bucket_public_access_block" "public_waas" {
  bucket = aws_s3_bucket.public_waas.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_waas" {
  bucket = aws_s3_bucket.public_waas.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.public_waas.arn}/*"
      },
    ]
  })
}
