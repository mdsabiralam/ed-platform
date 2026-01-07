# Support Portal Configuration (Ed-Platform)

**Platform:** Freshdesk / Zoho Desk (Proposed)

## Tier Structure

### L1: Automated Bot (Self-Service)
*   **Mechanism:** Chatbot widget on the login page and dashboard.
*   **Knowledge Base Source:** `docs/` subdomain.
*   **Auto-Responses:**
    *   *Keyword: "Password"* -> Link to "How to reset passwords".
    *   *Keyword: "Fee Receipt"* -> Link to "Generating Fee Receipts".
    *   *Keyword: "App Not Working"* -> Check server status page.

### L2: Support Agents (Operational)
*   **Scope:** Login issues, Data Sync errors, User mistakes.
*   **SLA:** 4 Business Hours.
*   **Workflow:**
    1.  Ticket created via Email (`support@edplatform.com`) or Portal.
    2.  Agent verifies Tenant ID and User Role.
    3.  Agent uses "Impersonation Mode" (if authorized) to verify the issue.
    4.  Resolution or Escalation to L3.

### L3: Engineering (Technical/Bugs)
*   **Scope:** System crashes, Data corruption, API 500 errors, Feature requests.
*   **Integration:** JIRA.
*   **Workflow:**
    1.  L2 Agent tags ticket as `Type: Bug`.
    2.  Webhook triggers JIRA Issue creation in `ED-PLATFORM` project.
    3.  Developers investigate logs (using PiiMasking).
    4.  Fix deployed -> JIRA Closed -> Support Ticket updated automatically.

## Initial Setup Checklist
- [ ] Domain verification (`support.edplatform.com`).
- [ ] SPF/DKIM records for email delivery.
- [ ] Import "Alpha School" staff emails as "VIP" customers.
