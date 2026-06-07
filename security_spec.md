# Firebase Hardened Security Rules Specification

This document details the critical data invariants, the "Dirty Dozen" threat payloads, and validation paths for the Lark POS Firestore database.

## 1. Data Invariants

Our relational, POS-centric domain model exposes four core collections on top of authentication constraints:

1.  **Products Collection (`/products/{productId}`)**:
    *   `productId` must match standard alphanumeric structure: `^[a-zA-Z0-9_\-]+$`.
    *   Price values (`variant.price`, `variant.importPrice`) must be non-negative numbers.
    *   Quantity tracking vectors (`variant.stock`, `variant.available`, `variant.shipping`) must remain non-negative.
    *   The `variants` list size must be strictly bounded (< 30 variants per product).

2.  **Customers Collection (`/customers/{customerId}`)**:
    *   `customerId` must match `^[a-zA-Z0-9_\-]+$`.
    *   Required properties: `name`, `phone`, `type`, `totalSpent`, `orderCount`, `createdAt`.
    *   The `type` field must be strictly within `['regular', 'vip', 'wholesale']` enum scopes.
    *   Accumulated values like `totalSpent` & `orderCount` must be non-negative.

3.  **Orders Collection (`/orders/{orderId}`)**:
    *   Must have an order ID of `^[a-zA-Z0-9_\-]+$`.
    *   Required: `items` list (not empty), `totalAmount`, `discount`, `tax`, `finalAmount`, `paymentMethod`, `status`, `createdAt`.
    *   Terminal state locking: Once `status` is set to `completed` or `canceled`, the document cannot be overwritten or changed further (terminal lock).
    *   The sum of values must hold valid proportions (e.g., `finalAmount` matches `totalAmount - discount + tax`).
    *   Temporal validation: `createdAt` timestamp must be strictly synchronized with transaction registry time.

4.  **Config Document (`/config/shop`)**:
    *   Single-point store metrics like email, phone, tax rate, name, address.
    *   Must only be writable by highly vetted owners/store leaders.


## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent illegal access or corrupt structures that our rules MUST strictly block:

### Payload 1: Spoofed Product ID Poisoning Attack
An attacker tries to save a product using a huge 10KB junk-character string as the ID to waste resources.
*   **Result**: `PERMISSION_DENIED` (blocked by `isValidId` on productId).

### Payload 2: Negative Pricing Injection
A product variant is written with a negative price (e.g. `price: -100000`) or negative cost.
*   **Result**: `PERMISSION_DENIED` (blocked by non-negative type check on prices).

### Payload 3: Shadow Custom Claims Promotion
A user profile registration attempt trying to pass extra parameters like `role: "admin"` inside an unchecked user profile doc or trying to self-promote.
*   **Result**: `PERMISSION_DENIED` (blocked because admins are vetted via explicit path existence `/admins/{uid}`).

### Payload 4: Invalid Customer Type Enum Exploitation
A guest payload trying to write a customer entity with a type of `"premium_platinum_hack"`.
*   **Result**: `PERMISSION_DENIED` (blocked by customer enum validation).

### Payload 5: Negative Customer Spend Registry
A write trying to set `totalSpent: -500000` to skew reports.
*   **Result**: `PERMISSION_DENIED` (blocked by spend bounding validators).

### Payload 6: Anonymous Order Creation without Verification
An unauthenticated request attempts to create an order, or a user whose email is not verified attempts writes.
*   **Result**: `PERMISSION_DENIED` (blocked by `isSignedIn()` and `request.auth.token.email_verified == true`).

### Payload 7: Terminal State Override
An order having `status: 'completed'` attempts an update to set `finalAmount: 0` or change `notes`.
*   **Result**: `PERMISSION_DENIED` (blocked by status terminal locking validator).

### Payload 8: Immutable Timestamp Spoofing
An items payload trying to manually override `createdAt` to a month ago (`createdAt: "2025-01-01T00:00:00Z"`) to evade chronological tracking.
*   **Result**: `PERMISSION_DENIED` (blocked by strict server time request checks on creation).

### Payload 9: Orphaned Order Registration
An order is submitted referencing a non-existent customer reference, or without validating product presence.
*   **Result**: `PERMISSION_DENIED` (blocked by `exists()` relational validation gates).

### Payload 10: Excess Map Bloat / Space Exhaustion
A product payload containing huge arbitrary "Ghost Fields" (Shadow parameters) to bloat document limits.
*   **Result**: `PERMISSION_DENIED` (blocked by `.keys().size()` exact check on create and `hasOnly()` on update).

### Payload 11: Empty Items Order Submission
An order gets published containing `items: []` to cause runtime crashes when calculating invoices.
*   **Result**: `PERMISSION_DENIED` (blocked by minimum size checks on array values).

### Payload 12: Administrative Config Override by Contributor
A general staff member tries to update the shop's tax rate or system-wide configurations.
*   **Result**: `PERMISSION_DENIED` (blocked by `isAdmin()` checks restricting config pathways).
