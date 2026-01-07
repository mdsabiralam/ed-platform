import os
import psycopg2
from google.cloud import bigquery
from datetime import datetime, timedelta

PG_HOST = os.environ.get('PG_HOST', 'localhost')
PG_DB = os.environ.get('PG_DB', 'ed_platform')
PG_USER = os.environ.get('PG_USER', 'admin')
PG_PASSWORD = os.environ.get('PG_PASSWORD', 'password123')
BQ_PROJECT = os.environ.get('BQ_PROJECT', 'ed-analytics-project')
BQ_DATASET = 'ed_analytics_warehouse'

def verify_warehouse_integrity():
    pg_conn = psycopg2.connect(
        host=PG_HOST,
        database=PG_DB,
        user=PG_USER,
        password=PG_PASSWORD
    )
    bq_client = bigquery.Client(project=BQ_PROJECT)

    yesterday = datetime.now() - timedelta(days=1)
    date_str = yesterday.strftime('%Y-%m-%d')

    # Check transactions table (Source) vs transactions_fact (Target)
    pg_cursor = pg_conn.cursor()
    pg_cursor.execute(f"SELECT COUNT(*) FROM transactions WHERE DATE(created_at) = '{date_str}'")
    pg_count = pg_cursor.fetchone()[0]

    bq_query = f"""
        SELECT COUNT(*)
        FROM `{BQ_PROJECT}.{BQ_DATASET}.transactions_fact`
        WHERE DATE(created_at) = '{date_str}'
    """
    bq_job = bq_client.query(bq_query)
    bq_count = list(bq_job.result())[0][0]

    if pg_count != bq_count:
        print(f"DATA DRIFT ALERT: Transactions count mismatch for {date_str}. Postgres (transactions): {pg_count}, BigQuery (transactions_fact): {bq_count}")
        # Send alert logic here
    else:
        print(f"Integrity Verified: Transactions count match for {date_str} ({pg_count})")

    pg_conn.close()

if __name__ == "__main__":
    verify_warehouse_integrity()
