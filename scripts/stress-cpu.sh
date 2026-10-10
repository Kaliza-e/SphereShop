#!/bin/bash
# Script to generate CPU load to trigger Alert Rule 2 (CPU > 80%)
echo "Simulating CPU load for 30 seconds..."
end=$((SECONDS+30))
while [ $SECONDS -lt $end ]; do
  for i in {1..1000000}; do :; done
done
echo "CPU stress completed."
