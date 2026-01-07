resource "cloudflare_ruleset" "main" {
  zone_id     = var.cloudflare_zone_id
  name        = "default"
  description = "Default WAF rules"
  kind        = "zone"
  phase       = "http_request_firewall_managed"

  rules {
    action = "block"
    expression = "(http.request.uri.query contains 'UNION SELECT' or http.request.uri.query contains '1=1') or (http.request.body.raw contains 'UNION SELECT' or http.request.body.raw contains '1=1')"
    description = "Block SQL Injection"
    enabled = true
  }

  rules {
    action = "block"
    expression = "(http.request.uri.query contains '<script>' or http.request.uri.query contains 'javascript:') or (http.request.body.raw contains '<script>' or http.request.body.raw contains 'javascript:')"
    description = "Block XSS"
    enabled = true
  }
}

variable "cloudflare_zone_id" {
  type = string
}
