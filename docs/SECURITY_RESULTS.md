# SphereShop — Security Verification & OWASP Results

This document records the security audit and OWASP verification results for SphereShop.

---

## OWASP Security Matrix

| Security Rule | Implementation / Protection Mechanism | Test Result |
|---|---|---|
| **SEC-01: Authentication & Lockout** | Generic error `Phone/e-mail or password is incorrect`; account locked 15 min after 5 failed attempts; sessions invalidated on logout | **PASSED** |
| **SEC-02: Access Control** | Shopper A accessing Shopper B's order returns HTTP 404 JSON (never 403); role checks enforced on server for `/admin/*` and `/agent/*` | **PASSED** |
| **SEC-03: Parameterized Queries** | All SQL/Memory queries parameterized; search probe `' OR 1=1--` yields no SQL error or extra data | **PASSED** |
| **SEC-04: TLS & Cookie Security** | Helmet security headers enabled; cookies set to `HttpOnly; SameSite=Lax; Secure` (when TLS enabled); passwords hashed with Argon2/bcrypt | **PASSED** |
| **SEC-05: Dependency Vulnerability Scanning** | `npm audit` integrated into `.gitlab-ci.yml` pipeline | **PASSED** |
| **SEC-06: Webhook HMAC Security** | Webhooks signed with HMAC-SHA256 (`x-payment-signature`); forged signatures return 401; duplicate webhooks handled idempotently | **PASSED** |
| **SEC-07: Payment Integrity** | Order state cannot be forced to `PAID` by client call or timeout; `PAID` state requires verified webhook `SUCCESS` | **PASSED** |
| **SEC-08: Log Redaction** | Structured JSON logs pass through `redactSensitiveData` layer; passwords, OTPs, delivery codes, PINs, card data redacted | **PASSED** |
| **SEC-09: Rate Limiting** | Rate limiting per IP and per phone enforced on sign-in and password reset OTP endpoints | **PASSED** |
| **SEC-10: File Upload Security** | Return photos validated by MIME type (JPG/PNG only) and size (<= 3MB); stored outside web root in `/uploads` | **PASSED** |
| **SEC-11: No Information Leakage** | Stack traces, SQL, file paths, and library versions suppressed in production; `/health` returns `{ "status": "ok" }` ONLY | **PASSED** |
