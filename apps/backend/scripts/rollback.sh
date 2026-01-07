#!/bin/bash
set -e

# Internal Service URL (only accessible from within the cluster)
HEALTH_ENDPOINT="http://backend-service/health"
MAX_RETRIES=12
DELAY=5

echo "Checking health at $HEALTH_ENDPOINT from within the cluster..."

# Use kubectl run to spin up a temporary pod to check connectivity
# We use a loop inside the pod to avoid spinning up 12 pods
kubectl run health-check-job --image=curlimages/curl --restart=Never --rm -i -- /bin/sh -c "
  for i in \$(seq 1 $MAX_RETRIES); do
    echo \"Attempt \$i/$MAX_RETRIES: Checking $HEALTH_ENDPOINT...\"
    if curl -s -f $HEALTH_ENDPOINT; then
      echo \"Health check passed!\"
      exit 0
    fi
    sleep $DELAY
  done
  echo \"Health check failed after $MAX_RETRIES attempts.\"
  exit 1
"

if [ $? -eq 0 ]; then
  echo "Deployment healthy."
  exit 0
else
  echo "Health check timed out. Initiating rollback..."
  kubectl rollout undo deployment/backend
  echo "Rollback initiated."
  exit 1
fi
