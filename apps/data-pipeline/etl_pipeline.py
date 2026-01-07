import os
import pandas as pd
from google.cloud import bigquery
import psycopg2
from datetime import datetime, timedelta

# Configuration
PG_HOST = os.environ.get('PG_HOST', 'localhost')
PG_DB = os.environ.get('PG_DB', 'ed_platform')
PG_USER = os.environ.get('PG_USER', 'admin')
PG_PASSWORD = os.environ.get('PG_PASSWORD', 'password123')
BQ_PROJECT = os.environ.get('BQ_PROJECT', 'ed-analytics-project')
BQ_DATASET = 'ed_analytics_warehouse'

def get_pg_connection():
    return psycopg2.connect(
        host=PG_HOST,
        database=PG_DB,
        user=PG_USER,
        password=PG_PASSWORD
    )

def load_table_to_bq_upsert(pg_conn, source_table, target_table, bq_client, bq_dataset_ref, primary_key='id'):
    print(f"Processing table: {source_table} -> {target_table}")

    # Incremental load: last 24 hours
    yesterday = datetime.now() - timedelta(days=1)
    query = f"SELECT * FROM {source_table} WHERE updated_at >= '{yesterday.strftime('%Y-%m-%d %H:%M:%S')}'"

    try:
        df = pd.read_sql(query, pg_conn)
        if df.empty:
            print(f"No new data for {source_table}")
            return

        # Load to temporary table
        temp_table_name = f"{target_table}_temp"
        temp_table_ref = bq_dataset_ref.table(temp_table_name)

        job_config = bigquery.LoadJobConfig(
            write_disposition="WRITE_TRUNCATE",
            autodetect=True
        )

        job = bq_client.load_table_from_dataframe(
            df, temp_table_ref, job_config=job_config
        )
        job.result()
        print(f"Loaded {len(df)} rows to temp table {temp_table_name}")

        # MERGE (Upsert) Logic
        # Assuming target table exists. In real prod code, we'd handle creation if not exists.
        merge_query = f"""
        MERGE `{BQ_PROJECT}.{BQ_DATASET}.{target_table}` T
        USING `{BQ_PROJECT}.{BQ_DATASET}.{temp_table_name}` S
        ON T.{primary_key} = S.{primary_key}
        WHEN MATCHED THEN
          UPDATE SET *
        WHEN NOT MATCHED THEN
          INSERT ROW
        """

        bq_client.query(merge_query).result()
        print(f"Merged data into {target_table}")

        # Cleanup temp table
        bq_client.delete_table(temp_table_ref)

    except Exception as e:
        print(f"Error processing {source_table}: {e}")

def main():
    pg_conn = get_pg_connection()
    bq_client = bigquery.Client(project=BQ_PROJECT)
    dataset_ref = bq_client.dataset(BQ_DATASET)

    # Mapping source tables to denormalized/fact table names
    # Added missing tables student_fee_ledgers and marketing_campaigns
    tables_map = {
        'transactions': 'transactions_fact',
        'attendance_logs': 'attendance_fact',
        'user_activity': 'user_activity_fact',
        'student_fee_ledgers': 'student_fee_ledgers', # Keeping name or could be fee_ledgers_fact
        'marketing_campaigns': 'marketing_campaigns'
    }

    for source, target in tables_map.items():
        load_table_to_bq_upsert(pg_conn, source, target, bq_client, dataset_ref)

    pg_conn.close()

if __name__ == "__main__":
    main()
