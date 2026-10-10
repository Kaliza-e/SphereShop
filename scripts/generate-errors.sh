#!/bin/bash
# Script to generate HTTP 5xx errors to trigger Alert Rule 1 (5xx error rate > 2%)
TARGET_URL=${1:-"http://localhost:3000/api/v1/non-existent-trigger-500"}

echo "Firing 50 HTTP error requests to ${TARGET_URL}..."
for i in {1..50}; do
  curl -s -o /dev/null -w "%{http_code}\n" "${TARGET_URL}"
  sleep 0.1
done
echo "Error generation cycle completed."
