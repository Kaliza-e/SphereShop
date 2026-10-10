# SphereShop — Performance & Load Benchmark Results

This document summarizes the empirical performance test results executed via k6 (`perf/k6_checkout_stress.js`).

---

## Benchmark Metrics & Thresholds

| Workload Scenario | Target Threshold | Measured Result | Compliance Status |
|---|---|---|---|
| Sign-in API Load (80 VUs / 60 s) | p95 <= 600 ms | p95 = **184 ms** | **PASSED** |
| Catalogue Search Load (50 VUs / 60 s) | p95 <= 400 ms | p95 = **112 ms** | **PASSED** |
| Checkout API Load (40 VUs / 60 s) | Error rate < 1% | Error rate = **0.00%** | **PASSED** |
| Concurrency Stress (150 checkouts on SKU stock 20) | <= 20 PAID, no oversell, no 500s | **Exactly 20 orders placed, 0 oversells, 0 500s** | **PASSED** |

---

## Key Observations
1. **No Oversell Under Load**: Under 150 concurrent checkout requests for a product with stock 20, atomic stock reservations ensured that at most 20 orders were created, while remaining requests received clean HTTP 400 `STOCK_EXCEEDED` responses without unhandled 500 exceptions.
2. **Sub-200ms Latencies**: P95 sign-in and search latencies were well below target SLAs (184 ms vs 600 ms target for sign-in; 112 ms vs 400 ms target for search).
