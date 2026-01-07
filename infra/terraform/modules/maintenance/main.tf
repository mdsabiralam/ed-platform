resource "aws_s3_bucket" "maintenance" {
  bucket = "${var.domain_name}-maintenance"
}

resource "aws_s3_bucket_website_configuration" "maintenance" {
  bucket = aws_s3_bucket.maintenance.id

  index_document {
    suffix = "maintenance.html"
  }
}

resource "aws_s3_object" "maintenance_page" {
  bucket       = aws_s3_bucket.maintenance.id
  key          = "maintenance.html"
  source       = "${path.module}/../../maintenance/maintenance.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/../../maintenance/maintenance.html")
}

resource "aws_cloudfront_distribution" "maintenance" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.maintenance.website_endpoint
    origin_id   = "S3-Maintenance"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "maintenance.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Maintenance"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.maintenance.domain_name
}

output "cloudfront_hosted_zone_id" {
  value = aws_cloudfront_distribution.maintenance.hosted_zone_id
}
