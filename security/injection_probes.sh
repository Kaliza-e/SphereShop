#!/bin/bash
# Security Probes Script (SQL Injection & Authorization Checks)
BASE_URL=${1:-"http://localhost:3000/api/v1"}

echo "Running Security Probes..."

echo "1. SQL Injection Probe on Search:"
res1=$(curl -s -w "%{http_code}" "${BASE_URL}/products?q=' OR 1=1--" -o /tmp/probe1.json)
echo "Status: ${res1}"

echo "2. SQL Injection Probe on Coupon Code:"
res2=$(curl -s -w "%{http_code}" -X POST "${BASE_URL}/cart/coupon" -H "Content-Type: application/json" -d '{"code":"\" OR \"1\"=\"1"}' -o /tmp/probe2.json)
echo "Status: ${res2}"

echo "3. Access Control Probe (Non-admin on Admin endpoint):"
res3=$(curl -s -w "%{http_code}" "${BASE_URL}/admin/products" -o /tmp/probe3.json)
echo "Status: ${res3}"

echo "Security Probes Completed."
