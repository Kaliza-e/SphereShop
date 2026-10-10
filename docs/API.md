# SphereShop — OpenAPI & API Documentation

All API endpoints are versioned under `/api/v1`. Error responses follow the unified JSON error contract:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description",
    "referenceId": "ERR-12345678"
  }
}
```

---

## Endpoint Index

### 1. Auth & Session
- `POST /api/v1/auth/register`: Register user (name, phone, email, password, confirmPassword). Auto sign-in and welcome SMS.
- `POST /api/v1/auth/login`: Sign in with phone OR email + password. Returns generic error on failure. Locks after 5 failed attempts for 15 minutes.
- `POST /api/v1/auth/logout`: Invalidates current server session.
- `POST /api/v1/auth/password-reset/request`: Request 6-digit OTP code via SMS.
- `POST /api/v1/auth/password-reset/confirm`: Reset password with valid 6-digit OTP.
- `GET /api/v1/auth/me`: Current authenticated user details.

### 2. Catalogue
- `GET /api/v1/products`: List published products (12 per page, search `q`, filters `category`, `minPrice`, `maxPrice`, sort `sort`).
- `GET /api/v1/products/:sku`: Product detail with stock badges (`In stock`, `Low stock`, `Out of stock`). Returns 404 JSON for unpublished/unknown products.
- `GET /api/v1/categories`: Category listing.

### 3. Cart & Coupons
- `GET /api/v1/cart`: Current cart lines, discounts, coupon info, and calculated totals quote.
- `POST /api/v1/cart/items`: Add SKU to cart (validates available stock).
- `PATCH /api/v1/cart/items/:productId`: Update quantity.
- `DELETE /api/v1/cart/items/:productId`: Remove line item.
- `POST /api/v1/cart/coupon`: Apply coupon code (6-12 alphanumeric, checks minimum subtotal).
- `DELETE /api/v1/cart/coupon`: Remove applied coupon.

### 4. Checkout & Orders
- `GET /api/v1/checkout/quote`: Invoice quote for selected delivery method (`STANDARD`, `EXPRESS`, `PICKUP`) and district (`Gasabo`, `Kicukiro`, `Nyarugenge`).
- `GET /api/v1/pickup-points`: List of store pickup points.
- `POST /api/v1/orders`: Place order (requires `Idempotency-Key` header). Reserves stock for 10 min. Returns HTTP 202.
- `GET /api/v1/orders`: My orders list (10 per page, newest first).
- `GET /api/v1/orders/:id`: Detailed order state, lines, history events, and masked payment ref.
- `POST /api/v1/orders/:id/pay`: Retry payment for failed/expired orders.
- `POST /api/v1/orders/:id/cancel`: Cancel order while in `PAID` or `PENDING_PAYMENT` state.

### 5. Fulfillment & Agent
- `GET /api/v1/admin/orders/queue`: Admin dispatch queue (`PAID` orders, oldest first).
- `POST /api/v1/admin/orders/:id/pack`: Set state to `PACKED`.
- `POST /api/v1/admin/orders/:id/assign-agent`: Assign delivery agent.
- `POST /api/v1/admin/orders/:id/dispatch`: Dispatch order (`OUT_FOR_DELIVERY`), generates 4-digit code and SMS.
- `GET /api/v1/agent/orders`: List agent's assigned deliveries.
- `POST /api/v1/agent/orders/:id/confirm-delivery`: Verify 4-digit code. 3 wrong attempts trigger `DELIVERY_DISPUTE` & Admin alert.

### 6. Returns & Refunds
- `POST /api/v1/orders/:id/returns`: Request return (within 7 days of delivery, returnable items only, photo upload <= 3MB).
- `GET /api/v1/returns`: My returns list.
- `GET /api/v1/admin/returns`: Admin returns inbox.
- `POST /api/v1/admin/returns/:id/approve`: Approve return & generate 7-day drop-off code.
- `POST /api/v1/admin/returns/:id/reject`: Reject return with reason.
- `POST /api/v1/admin/returns/:id/accept`: Accept returned item, restock non-faulty, issue refund. Delivery fee refunded ONLY if item was faulty.

### 7. Service Booking
- `GET /api/v1/services`: List available setup visit services.
- `GET /api/v1/services/:id/slots?date=YYYY-MM-DD`: List free capacity slots (Mon-Sat 09:00-16:00, capacity 2).
- `POST /api/v1/bookings`: Atomic slot reservation. Race condition returns `409 SLOT_TAKEN` with next free slots.
- `GET /api/v1/bookings`: My service visit bookings.
- `DELETE /api/v1/bookings/:id`: Cancel booking (must be >= 4 hours before start).

### 8. System & Monitoring
- `GET /health`: Health status (`{ "status": "ok" }` ONLY).
- `GET /metrics`: Prometheus metrics exporter.
