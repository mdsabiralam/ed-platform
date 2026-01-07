# Disaster Recovery Playbook

**RTO Goal:** 1 Hour
**RPO Goal:** 5 Minutes

## Phase 1: Assessment & Declaration (0-10 Minutes)
1. **Detection:** CloudWatch Alarms trigger (e.g., `HealthyHostCount < 1`, `5xx Error Rate > 5%`).
2. **Verification:** Engineer confirms the primary region (ap-south-1) is unresponsive.
3. **Declaration:** Incident Commander (IC) declares "DISASTER MODE".
   - Set `is_dr_active = true` in Terraform variables.
   - Notify stakeholders (see Communication Plan).

## Phase 2: Database Failover (10-20 Minutes)
1. **Promote Read Replica:**
   - Go to AWS Console > RDS > Databases.
   - Select the Cross-Region Read Replica in `ap-southeast-1`.
   - Action > Promote.
   - Wait for status to change from `Modifying` to `Available`.
2. **Update Connection Strings:**
   - Update the backend secret `DATABASE_URL` to point to the new Primary DB endpoint.
3. **Verify Data:**
   - Check latest `Transaction Logs` timestamp to ensure RPO < 5 mins compliance.

## Phase 3: Infrastructure Spin-Up (20-40 Minutes)
1. **Provision DR Infrastructure:**
   - Run Terraform to provision the Cold Standby environment.
     ```bash
     terraform apply -var="is_dr_active=true" -target=module.vpc_dr -target=module.eks_dr
     ```
2. **Deploy Applications:**
   - Connect `kubectl` to the new DR Cluster.
   - Run `helm install ed-platform ./charts/ed-platform --set database.host=<NEW_DB_ENDPOINT>`.
   - Scale up replicas to handle traffic.

## Phase 4: Traffic Switching (40-50 Minutes)
1. **Update DNS:**
   - Route53 Health Checks should have already flipped to the **Maintenance Page**.
   - Manually update Route53 `Failover Record` (Secondary) to point to the new **DR Load Balancer** instead of Maintenance Page.
   - Flush DNS cache if possible (TTL is 60s, so propagation is fast).

## Phase 5: Verification (50-60 Minutes)
1. **Sanity Check:**
   - Verify Login, Feed, and Critical Writes.
2. **Public Announcement:**
   - Send "Service Restored" email.

## Post-Mortem
- Analyze root cause.
- Failback to primary region once stable (requires new replication setup).
