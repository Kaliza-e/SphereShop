# SphereShop — Observability & Alerting Guide

This document describes the structured logging, Prometheus metrics, Loki log shipping, Grafana dashboards, and Alertmanager rules configured for SphereShop.

---

## 1. Structured JSON Logging
All API request logs are written to stdout as single-line JSON objects containing:
- `timestamp`: ISO-8601 formatted timestamp
- `level`: Log level (`info`, `error`, `warn`)
- `method`: HTTP method (`GET`, `POST`, etc.)
- `path`: Target API route
- `status`: HTTP status code
- `duration_ms`: Response latency in milliseconds
- `referenceId`: Unique request / error reference ID

### Sensitive Data Redaction Layer (SEC-08)
Passwords, tokens, OTPs, delivery codes, PINs, card numbers, and CVVs are automatically redacted by `redactSensitiveData` before reaching stdout.

---

## 2. Prometheus Metrics (`/metrics`)
The API exposes Prometheus metrics at `GET /metrics`:
- `http_request_duration_seconds`: Histogram of latencies by method, route, and status code.
- `http_requests_total`: Counter of total HTTP requests.
- `http_errors_total`: Counter of HTTP 5xx error responses.
- `sphereshop_orders_total`: Business counter tracking orders by status (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, etc.).
- `sphereshop_payments_total`: Business counter tracking payments by outcome (`SUCCESS`, `FAILED`).
- `sphereshop_webhook_duplicates_total`: Counter of duplicate webhook deliveries ignored.

---

## 3. Grafana Golden Signals Dashboard
Provisioned JSON dashboard `sphereshop_golden_signals.json` contains four golden signal panels:
1. **Latency**: p50, p95, and p99 request duration quantiles.
2. **Traffic**: Requests per second (`req/s`).
3. **Errors**: HTTP 5xx error rate percentage (`(http_errors_total / http_requests_total) * 100`).
4. **Saturation**: Container CPU and memory utilization.

---

## 4. Alert Rules & Verification Scripts

### Alert Rule 1: HTTP 5xx Error Rate > 2% for 5 minutes
- **Trigger Script**: `scripts/generate-errors.sh`
- **Action**: Fires 50 consecutive HTTP 500 error requests to `/api/v1/non-existent-trigger-500` to exceed the 2% threshold.

### Alert Rule 2: CPU Utilization > 80% for 5 minutes
- **Trigger Script**: `scripts/stress-cpu.sh`
- **Action**: Generates intensive CPU loops for 30 seconds to trigger CPU utilization alert thresholds.
