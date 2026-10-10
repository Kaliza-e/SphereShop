# SphereShop — Staff & Admin Quick-Start Guide

Welcome to the Cloud Sphere Solutions Admin & Operations guide. This document explains how non-technical staff can manage products, fulfill orders, and process customer returns.

---

## 1. How to Access the Admin Console
1. Open the storefront at `http://localhost/` or the UAT URL.
2. Sign in with staff credentials:
   - **Ops Admin**: `ops@spheretest.rw` / `Kigali2026`
   - **Delivery Agent**: `agent@spheretest.rw` / `Kigali2026`
3. Click the **Admin** or **Agent** badge in the top navigation bar.

---

## 2. Publishing & Managing Products
1. Go to **Admin Console -> Product Management**.
2. Click **Create New Product**.
3. Fill in the details:
   - **SKU**: Unique identifier (e.g. `CAP-10`). *Note: SKU becomes immutable once published.*
   - **Price (RWF)**: Must be an integer greater than 0.
   - **Stock**: Non-negative integer.
   - **Returnable Flag**: Checked for returnable items (uncheck for digital vouchers/clearance).
4. Set status to `PUBLISHED` and save. Changes take effect on the storefront within 5 seconds.

---

## 3. Packing & Dispatching Orders
1. Go to **Admin Console -> Dispatch Queue**.
2. Orders in `PAID` state appear ordered by creation time (oldest first).
3. Click **Pack Order** (`PAID -> PACKED`).
4. Select an assigned **Delivery Agent** from the dropdown and click **Assign Agent**.
5. Click **Dispatch Order** (`PACKED -> OUT_FOR_DELIVERY`).
   - A unique 4-digit delivery code is automatically generated and sent to the shopper via SMS.

---

## 4. Delivery Confirmation (Delivery Agent Mobile View)
1. Delivery Agent logs into `/agent` on a mobile browser.
2. View assigned orders listed by delivery address.
3. Upon handing over the parcel, ask the shopper for their 4-digit delivery code.
4. Enter the code and click **Confirm Delivery**:
   - Correct code: Order transitions to `DELIVERED` and notifies the shopper.
   - Incorrect code: Shows "Code incorrect".
   - *Warning*: Entering 3 incorrect codes locks the delivery, flags the order as `DELIVERY_DISPUTE`, and alerts the Ops Admin.

---

## 5. Processing Customer Returns & Refunds
1. Go to **Admin Console -> Returns Inbox**.
2. When a shopper requests a return (eligible within 7 days of delivery for returnable items):
   - Review reason and photo upload.
   - Click **Approve**: Sends a 7-day drop-off code to the shopper with pickup location instructions.
   - Click **Reject**: Declines return with a reason.
3. When the returned item arrives at the pickup hub:
   - Inspect item condition.
   - Click **Accept Return**: Automatically restocks non-faulty items and triggers a refund to the shopper's original payment method via mobile money/card adapter.
