resource "google_bigquery_dataset" "ed_analytics_warehouse" {
  dataset_id                  = "ed_analytics_warehouse"
  friendly_name               = "Ed Analytics Warehouse"
  description                 = "Data warehouse for SaaS analytics"
  location                    = var.region
  default_table_expiration_ms = 3600000 # 1 hour (Sandbox mode simulation / cost control)

  labels = {
    env = "production"
  }
}

resource "google_bigquery_dataset_access" "etl_runner_writer" {
  dataset_id    = google_bigquery_dataset.ed_analytics_warehouse.dataset_id
  role          = "roles/bigquery.dataEditor"
  user_by_email = var.etl_runner_email
}

resource "google_bigquery_dataset_access" "data_analyst_reader" {
  dataset_id    = google_bigquery_dataset.ed_analytics_warehouse.dataset_id
  role          = "roles/bigquery.dataViewer"
  user_by_email = "analyst@example.com" # Placeholder or variable
}
