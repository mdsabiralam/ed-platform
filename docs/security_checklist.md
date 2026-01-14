# Security Checklist

## 2.I.05 Network Restrictions (Database)

To ensure the database (Supabase/RDS) accepts connections **ONLY** from authorized Backend IP addresses or the VPC, follow these verification steps:

### For Supabase
1.  **Navigate to Project Settings:** Go to the Supabase Dashboard -> Project Settings -> Database -> Network Restrictions.
2.  **Verify IP Allowlist:**
    *   Ensure that "Allow all IP addresses" (0.0.0.0/0) is **UNCHECKED**.
    *   Verify that only the following IP addresses are listed in the allowlist:
        *   **Production Backend Static IP / NAT Gateway IP:** [Insert Production IP here]
        *   **Staging Backend Static IP:** [Insert Staging IP here]
        *   **CI/CD Pipeline IP (if applicable):** [Insert CI/CD IP here]
        *   **Developer VPN IP (optional, for direct access):** [Insert VPN IP here]

### For AWS RDS (PostgreSQL)
1.  **Check "Publicly Accessible" Setting:**
    *   Go to RDS Console -> Databases -> [Select Instance] -> Connectivity & security.
    *   Verify that **"Publicly Accessible"** is set to **"No"**.
2.  **Verify Security Groups:**
    *   Click on the "VPC security groups" link associated with the instance.
    *   Check the **Inbound Rules**:
        *   **Type:** PostgreSQL (TCP/5432)
        *   **Source:** Should be set to the **Security Group ID of the Backend Service** (e.g., `sg-xxxxxxxx` for the ECS/EC2 Backend) or the **VPC CIDR** (e.g., `10.0.0.0/16`) for internal private networking.
        *   **DENY/ABSENT:** Ensure there are **NO** rules allowing source `0.0.0.0/0` (Anywhere) on port 5432.

### For General VPC/Firewall Configuration
1.  **Network ACLs:** Ensure Network ACLs for the Database Subnet allow inbound traffic on port 5432 only from the App Subnet.
2.  **Connection Test:** From a machine *outside* the allowlisted IPs (e.g., a personal laptop without VPN), attempt to connect using `psql`. The connection must time out or be refused.
