# GDPR & DPDP Compliance Strategy

## 1. Data Encryption (At Rest & In Transit)
- **PII Encryption:** Sensitive fields like `email`, `phone`, `medical_history`, and `allergies` are encrypted at the application level using AES-256-GCM before storage.
- **Database Encryption:** `pgcrypto` extension is enabled.
- **Transport Security:** SSL/TLS is enforced for all database connections in production environments via `PrismaService` configuration.

## 2. Right to be Forgotten (Data Erasure)
- **Soft Delete:** We have implemented a "Soft Delete" mechanism (`deleted_at` column) for critical entities (Users, Students, Institutes) to prevent accidental data loss while allowing logical removal.
- **Hard Delete Policy:** Upon specific request (Right to Erasure) or contract termination, a scheduled job can permanently remove records marked as soft-deleted after a retention period (e.g., 30 days).

## 3. Access Control & Isolation
- **Row Level Security (RLS):** Database-level policies ensure that institutes (schools) cannot access each other's data.
- **Role-Based Access Control (RBAC):** Strict roles (Super Admin, Admin, Teacher, Student) limit access to specific API endpoints.
- **Read-Only Access:** Dedicated database users for analytics to prevent unauthorized modification.

## 4. Audit Trails
- **Audit Logs:** Critical actions (Create, Update, Delete) on sensitive tables are logged in `table_audit_logs` and `platform_audit_logs`.
- **Traceability:** Every change records the `changed_by` (User ID) and `changed_at` timestamp.

## 5. Data Minimization
- We only collect data necessary for academic and administrative functions.
- KYC documents are stored securely with restricted access URLs.

## 6. Breach Notification
- In case of a security breach, the system is designed to detect anomalies via Audit Logs.
- Affected users will be notified within 72 hours as per GDPR guidelines.

## 7. Consent Management
- Explicit consent is required for collecting sensitive health data (Health Profiles).
