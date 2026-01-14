# Compliance Strategy (GDPR / DPDP)

## 1. Right to be Forgotten (Data Erasure)

To comply with "Right to be Forgotten" requests under GDPR and similar DPDP regulations, the platform implements a two-stage erasure process:

### Stage 1: Soft Delete (Immediate)
*   **Action:** When a user or student requests deletion, the `deletedAt` timestamp is set on their record (`User`, `Student`, `StaffProfile`).
*   **Effect:** The data becomes invisible to standard application queries (filtered out by Prisma middleware) but remains in the database for a grace period (e.g., 30 days) to allow for recovery from accidental deletion.

### Stage 2: Anonymization / Permanent Deletion (Scheduled)
*   **Action:** A background cron job runs nightly to identify records where `deletedAt` is older than the retention period.
*   **Anonymization:** For data that must be kept for statistical purposes (e.g., attendance counts, grade distributions), Personal Identifiable Information (PII) is anonymized:
    *   `firstName` / `lastName`: Replaced with "Deleted User".
    *   `email`: Scrambled (e.g., `deleted_uuid@anonymized.com`).
    *   `phone`: Nullified or replaced with dummy data.
    *   `HealthProfile`: The encrypted columns (`allergies`, `medicalHistory`, `medications`) are permanently deleted or the encryption key for that specific record (if per-user keys were used) is destroyed.
*   **Pruning:** Non-essential records (e.g., session logs, temp files) are permanently deleted (`DELETE`).

## 2. Data Residency

To comply with data residency laws (ensuring citizen data stays within the country):

### Infrastructure
*   **Region Selection:** The Production Database (AWS RDS / Supabase) is provisioned specifically in the AWS Region corresponding to the client's legal jurisdiction (e.g., `ap-south-1` for India, `eu-central-1` for Germany).
*   **Backups:** Cross-region replication of backups is disabled or strictly controlled to ensure backups do not leave the sovereign territory unless explicitly authorized by compliance addendums.

### Logical Segregation (Multi-tenancy)
*   **Row Level Security (RLS):** The platform uses strict Row Level Security (enforced by `institute_id`) to logically isolate data. While multiple institutes might share a physical database cluster within the correct region, RLS ensures no cross-contamination of data access.
*   **Institute Config:** Each Institute can optionally be tagged with a specific region requirement, and the application creates their tenant in the corresponding regional database shard if a multi-region architecture is adopted in the future.
