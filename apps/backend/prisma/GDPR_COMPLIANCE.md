# 2.I.10 GDPR & DPDP Compliance Strategy

This document outlines the technical and procedural strategies implemented in the EdPlatform to ensure compliance with GDPR (General Data Protection Regulation) and DPDP (Digital Personal Data Protection Act).

## 1. Right to be Forgotten (Data Erasure)
*   **Implementation:** We have implemented a "Soft Delete" mechanism (Requirement 2.I.02).
*   **Strategy:** When a user requests deletion, the `deleted_at` timestamp is set.
*   **Hard Delete:** A scheduled cron job (to be implemented) will permanently remove records older than X days (e.g., 90 days) from the database to fully comply with the "Right to Erasure" after a retention period.

## 2. Data Encryption & Security
*   **At Rest:** Sensitive health data (`medicalHistory`, `medications`, etc.) and KYC documents (`documentUrl`) are encrypted at the column level using AES-256-CBC (Requirement 2.I.01 & 2.I.07).
*   **In Transit:** SSL/TLS is enforced for all database connections (Requirement 2.I.04). API communication should also be over HTTPS.
*   **Password Policy:** Strong password policies (Complexity, Rotation) are enforced (Requirement 2.I.08).

## 3. Audit Trails & Accountability
*   **Implementation:** Database triggers log all `INSERT`, `UPDATE`, and `DELETE` operations on critical tables like `Fees` and `Marks` into an `audit_logs` table (Requirement 2.I.06).
*   **Purpose:** This ensures traceability of who accessed or modified data and when, crucial for compliance audits.

## 4. Access Control & Network Security
*   **Least Privilege:** A specific read-only user (`analytics_reader`) is created for reporting to prevent accidental modification (Requirement 2.I.03).
*   **Network Restrictions:** Database access is restricted to specific backend IP addresses (Requirement 2.I.05).
*   **Bot Protection:** Honey Pot fields are used to prevent automated bot attacks (Requirement 2.I.10 - Honey Pot).

## 5. Data Portability
*   **Strategy:** The system architecture allows for exporting user data (Student profiles, Academic records) via JSON APIs, enabling users to take their data elsewhere if desired.

## 6. Consent Management (Planned)
*   **Strategy:** Explicit consent must be obtained before collecting sensitive data (Health, KYC). The UI should display clear checkboxes for consent, and the backend should store the timestamp and version of the consent agreement.

## 7. Breach Notification
*   **Procedure:** In case of a data breach, the system administrators will notify affected users and relevant authorities within 72 hours, as mandated by GDPR.