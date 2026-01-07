# Chaos Monkey Resilience Test (13.G.10)

**Objective:** Verify that the infrastructure automatically recovers from component failures without human intervention.

## Prerequisites
- Staging Environment (EKS Cluster).
- Tool: `kube-monkey` or manual `kubectl` access.

## Test Scenarios

### Scenario 1: Pod Deletion
1. **Action:**
   ```bash
   kubectl delete pod -l app=auth-service -n staging
   ```
2. **Expected Behavior:**
   - Kubernetes ReplicaSet notices the count mismatch (Current < Desired).
   - A new pod is scheduled immediately.
   - Downtime: < 2 seconds (or 0 if multiple replicas exist).
3. **Verification:**
   - Run `kubectl get pods -w` to see the termination and creation.
   - Check `/health` endpoint during the deletion.

### Scenario 2: Node Termination
1. **Action:**
   - Find a worker node instance ID.
   - Terminate it via AWS Console or CLI:
     ```bash
     aws ec2 terminate-instances --instance-ids i-0xxxxxxxx
     ```
2. **Expected Behavior:**
   - EKS Node Group Auto Scaling Group detects the unhealthy instance.
   - Pods on the node enter `Terminating`.
   - Pods are rescheduled to healthy nodes.
   - A new node is provisioned by ASG to replace the terminated one.
3. **Verification:**
   - Monitor `kubectl get nodes`.
   - Monitor Service availability.

## Verification Log
- **Date:** [YYYY-MM-DD]
- **Tester:** [Name]
- **Result:** [Pass/Fail]
