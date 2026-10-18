# SphereShop — Containerized E-Commerce & Service-Booking Platform
**Cloud Sphere Solutions, Kigali, Rwanda**

SphereShop is a production-grade e-commerce storefront, REST API, and service-booking platform designed for Cloud Sphere Solutions in Kigali, Rwanda. It sells electronics accessories, home-office gear, and books device-setup visits.

---

## Quick Start

### 1. Local Full-Stack Development (Single Command)
Run both the Backend API and Frontend Storefront together with live reload and color-coded logs:

```bash
# From the project root (cloudsphere)
npm run dev
```

This starts:
- **Web Storefront**: [http://localhost:5173](http://localhost:5173)
- **REST API & Health Check**: [http://localhost:3001/api/v1/products](http://localhost:3001/api/v1/products) | [http://localhost:3001/health](http://localhost:3001/health)

*(Optional: Run them in separate terminals)*:
- **Backend API**: `cd api && npm run dev` (Port 3001)
- **Frontend Web**: `cd web && npm run dev` (Port 5173)

---

### 2. Docker Compose (Full Stack with Observability)

```bash
docker compose up -d
```

Access services:
- **Web Storefront**: `http://localhost/`
- **REST API**: `http://localhost:3000/api/v1/products` | `http://localhost:3000/health`
- **Prometheus Metrics**: `http://localhost:3000/metrics` | `http://localhost:9090`
- **Grafana Dashboards**: `http://localhost:3001` (login: `admin` / `admin`)

---

## Stack & Architecture

- **Storefront (`/web`)**: React 18 + TypeScript + Vite, served by Nginx with responsive glassmorphic UI.
- **REST API (`/api`)**: Node.js 20 + Express + TypeScript, Winston JSON logging, Prom-client metrics.
- **Database & Cache**: PostgreSQL 16 (StatefulSet + PVC) and Redis 7 (sessions & TTLs).
- **Payment & Notification Adapters**: Controllable stub adapters with HMAC-SHA256 signature verification.
- **Observability (`/observability`)**: Prometheus scraping `/metrics`, Loki JSON log collector, Promtail, Grafana golden signals dashboard, Alertmanager rules.

---

## Business Rules & Currency Constraints
- **Currency**: **RWF** (Rwandan Francs). All computed amounts are rounded **DOWN** to a whole franc (`floor`). No decimals are shown. Formatted with thousands separators (e.g. `12,000 RWF`).
- **Time Zone**: **Africa/Kigali (UTC+2)**. Express delivery cut-off is 14:00 Kigali time.
- **Delivery Fee**: Standard 1,500 RWF (Free if `netAfterCoupon >= 40,000 RWF` or shopper is loyal >= 5 delivered orders); Express 3,500 RWF (only before 14:00, never free); Pickup 0 RWF. Delivery available in **Gasabo, Kicukiro, Nyarugenge**.

---

## Seed Data Credentials

| Role | Name | Phone | E-mail | Password |
|---|---|---|---|---|
| Shopper (Standard) | Aline | `0781000001` | `aline@spheretest.rw` | `Kigali2026` |
| Shopper (Loyal >=5 orders) | Eric | `0791000002` | `eric@spheretest.rw` | `Kigali2026` |
| Locked Shopper (15 min) | Locked User | `0721000003` | `locked@spheretest.rw` | `Kigali2026` |
| Store Admin | Ops Admin | `0788000000` | `ops@spheretest.rw` | `Kigali2026` |
| Delivery Agent | Delivery Agent | `0789000000` | `agent@spheretest.rw` | `Kigali2026` |

---

## Verification & Testing Commands

### Run Full API Unit & Integration Test Suite (119 UAT Scenarios)
```bash
cd api
npm test
```
*Coverage requirement:* >= 70% on pricing, coupon, state machine, and payment modules.

### Run Web Storefront Build
```bash
cd web
npm run build
```

### Run Performance Benchmarks (k6)
```bash
k6 run perf/k6_checkout_stress.js
```

### Run Security Probes
```bash
bash security/injection_probes.sh
```

---

## Documentation Index
- [`rtm.csv`](rtm.csv): Requirement Traceability Matrix (119 UAT scenarios mapped to code and test IDs)
- [`docs/UAT_EXECUTION_LOG.md`](docs/UAT_EXECUTION_LOG.md): Full empirical UAT execution log
- [`docs/ADMIN_QUICKSTART.md`](docs/ADMIN_QUICKSTART.md): Non-technical staff quick-start guide
- [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md): Architecture choices and design decisions
- [`docs/API.md`](docs/API.md): OpenAPI specification and REST endpoint reference
- [`docs/K8S.md`](docs/K8S.md): Kubernetes deployment & scaling guide
- [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md): Metrics, Loki logs, Grafana dashboard & alerts
- [`docs/PERF_RESULTS.md`](docs/PERF_RESULTS.md): Performance benchmark results
- [`docs/SECURITY_RESULTS.md`](docs/SECURITY_RESULTS.md): OWASP security audit results
- [`docs/PIPELINE_EVIDENCE.md`](docs/PIPELINE_EVIDENCE.md): CI/CD pipeline proof
