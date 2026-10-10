# SphereShop — Assumptions & Design Decisions

This document lists all explicit design choices and assumptions made in building the SphereShop platform for Cloud Sphere Solutions, Kigali, Rwanda.

## 1. Stack & Architecture Decisions
- **API Stack**: Node.js 20 + Express + TypeScript. Fast, lightweight, and fully testable with Jest and Supertest.
- **Storefront Stack**: React 18 + TypeScript + Vite served by Nginx. Responsive mobile-first glassmorphic UI.
- **Database & State Store**: PostgreSQL 16 for primary relational persistence; Redis 7 for session cache and anonymous carts. An in-memory data store wrapper (`MemoryDb`) is included to allow isolated unit/integration test execution without requiring a live Postgres daemon.
- **Payment & Notification Adapters**: Controllable stub adapters (`PaymentAdapterService`) supporting runtime mode switching (`success`, `decline`, `silent`, `late-success`) and HMAC-SHA256 signature verification.

## 2. Business Rules & Pricing Algorithm
- **Rounding Rule**: All price totals are integers rounded **DOWN** to whole RWF (`Math.floor`). No decimals are shown.
- **Free Delivery Threshold**: Standard delivery (1,500 RWF) is **free** if `netAfterCoupon >= 40,000` RWF (exactly 40,000 is free) OR if the shopper is loyal (>= 5 orders in `DELIVERED` state).
- **Express Delivery**: Fixed at 3,500 RWF, available only before 14:00 Kigali Time (UTC+2), and is **never free** (even for loyal shoppers or high order amounts).
- **Line Discount**: 8% applied per line where SKU quantity >= 6, calculated before coupon discounts.
- **Delivery Districts**: Enforced at district level (Gasabo, Kicukiro, Nyarugenge). Other locations receive `We do not deliver there yet` and are offered Pickup (0 RWF).

## 3. Order State Machine & Stock
- State machine rules are enforced centrally in `api/src/domain/orderStateMachine.ts`. Any illegal transition raises an HTTP 409 error.
- Stock reservations last 10 minutes from order placement (`PENDING_PAYMENT`).
- Duplicate webhooks with identical `providerRef` are handled idempotently and return 200 without triggering state re-transitions or duplicate metrics.

## 4. Environment & Verification Limits
- Docker Compose and Kubernetes manifests (`/k8s/`) have been created, validated, and formatted for seamless deployment on kind/minikube and Docker Compose environments.
