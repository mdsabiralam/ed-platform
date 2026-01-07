import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
from google.cloud import bigquery
import os

BQ_PROJECT = os.environ.get('BQ_PROJECT', 'ed-analytics-project')
BQ_DATASET = 'ed_analytics_warehouse'

def get_churn_data():
    """
    Fetches feature engineered data from BigQuery for Churn Prediction.
    Feature Engineering:
    1. login_frequency_last_30_days: Count of LOGIN events in user_activity_fact
    2. support_ticket_count: Count of tickets in transactions_fact (assuming tickets tracked or separate table, simplifying here to use available facts or mock logic if table missing)
    3. late_fee_volume: Sum of late fees from student_fee_ledgers
    """
    client = bigquery.Client(project=BQ_PROJECT)

    # Constructing a feature query joining tenant stats
    # Note: In a real scenario, we'd join user_activity_fact, student_fee_ledgers aggregated by Tenant

    query = f"""
        SELECT
            t.id as school_id,
            -- Feature 1: Login Frequency (Mocked aggregation logic from user_activity)
            (SELECT COUNT(*) FROM `{BQ_PROJECT}.{BQ_DATASET}.user_activity_fact` ua
             WHERE ua.tenant_id = t.id AND ua.event_type = 'LOGIN'
             AND ua.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)) as login_frequency_last_30_days,

            -- Feature 2: Support Ticket Count (Placeholder, assuming similar aggregation)
            (SELECT COUNT(*) FROM `{BQ_PROJECT}.{BQ_DATASET}.transactions_fact` tr
             WHERE tr.tenant_id = t.id AND tr.type = 'TICKET') as support_ticket_count,

            -- Feature 3: Late Fee Volume
            (SELECT COALESCE(SUM(late_fee), 0) FROM `{BQ_PROJECT}.{BQ_DATASET}.student_fee_ledgers` fl
             WHERE fl.tenant_id = t.id) as late_fee_volume,

            -- Label: is_churned (assuming status column on tenant)
            CASE WHEN t.status = 'CANCELLED' THEN 1 ELSE 0 END as is_churned

        FROM `{BQ_PROJECT}.{BQ_DATASET}.tenants` t
    """

    try:
        df = client.query(query).to_dataframe()
        return df
    except Exception as e:
        print(f"Error fetching data from BQ: {e}")
        # Fallback to mock data for demonstration if BQ not available
        return pd.DataFrame({
            'login_frequency_last_30_days': [10, 50, 5, 100, 2],
            'support_ticket_count': [5, 1, 10, 0, 8],
            'late_fee_volume': [1000, 0, 5000, 0, 2000],
            'is_churned': [0, 0, 1, 0, 1]
        })

def train_churn_model():
    data = get_churn_data()

    if data.empty:
        print("No data available for training.")
        return

    X = data[['login_frequency_last_30_days', 'support_ticket_count', 'late_fee_volume']]
    y = data['is_churned']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    clf = RandomForestClassifier(n_estimators=100)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print(f"Model Accuracy: {accuracy_score(y_test, y_pred)}")

    joblib.dump(clf, 'churn_model.pkl')
    print("Model saved to churn_model.pkl")

def predict_churn(school_data):
    clf = joblib.load('churn_model.pkl')
    risk_score = clf.predict_proba(school_data)[:, 1] * 100 # Risk score 0-100
    return risk_score

if __name__ == "__main__":
    train_churn_model()
