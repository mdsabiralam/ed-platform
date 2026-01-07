# Service Level Agreement (SLA) - Premium Tier

**Effective Date:** 2024-01-01
**Provider:** Ed-Platform
**Customer:** [School Name]

## 1. Uptime Guarantee
Ed-Platform guarantees a Monthly Uptime Percentage of **99.9%** for the SaaS Service.

*   **Definition:** "Uptime" refers to the availability of the core API and Web Interface, excluding scheduled maintenance.
*   **Remedy:** If Uptime falls below 99.9% in any given billing month, the Customer is eligible for Service Credits:
    *   < 99.9% but >= 99.0%: 10% Credit
    *   < 99.0%: 25% Credit

## 2. Data Privacy & Compliance
Ed-Platform processes student and staff data in strict compliance with the Digital Personal Data Protection (DPDP) Act and GDPR.

*   **Right to be Forgotten:** We provide mechanisms to anonymize user data upon request (`POST /user/forget-me`).
*   **Data Residency:** All data for Indian tenants is stored exclusively within the `ap-south-1` (Mumbai) AWS Region.
*   **Encryption:** Data is encrypted at rest (AES-256) and in transit (TLS 1.2+). PII in logs is masked.

## 3. Support Response Times
For "Premium" tier customers, we commit to the following response times based on severity:

*   **Critical (P0):** System Down, Data Loss.
    *   *Response Time:* < 4 Hours (24/7).
*   **High (P1):** Core feature broken (e.g., Cannot collect fees).
    *   *Response Time:* < 8 Business Hours.
*   **Normal (P2):** Minor bugs, UI glitches.
    *   *Response Time:* < 2 Business Days.
*   **Low (P3):** Feature Requests, General Questions.
    *   *Response Time:* < 5 Business Days.
