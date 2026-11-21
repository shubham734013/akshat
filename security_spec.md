# AKSHAT (अक्षत) Firestore Security Specification

## 1. Data Invariants
1. **Default Deny**: All unmatched paths are unconditionally denied.
2. **Verified Identity**: All authenticated writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Isolation**: User profiles (`/users/{userId}`), addresses (`/users/{userId}/addresses/{addressId}`), orders (`/orders/{orderId}`), refund requests, support tickets, and newsletter records are strictly readable only by the owning user (`request.auth.uid == userId`) or a verified administrator.
4. **Admin Isolation**: Catalog mutations (`categories`, `products`, `coupons`, `homepage_config`, `inventory_movements`, `admins`, `audit_logs`) are strictly restricted to verified administrators (`shubhamajay65@gmail.com` or `/admins/{uid}`).
5. **Query Enforcer**: Every private `allow list` rule validates `resource.data.userId == request.auth.uid` or `isAdmin()`, never delegating query filtering to client code.
6. **Temporal & Immutable Integrity**: All `createdAt` and `updatedAt` timestamps on write must equal `request.time`; `createdAt` and `userId` are immutable on update.
7. **Terminal State Locking**: Orders in terminal states (`delivered`, `cancelled`, `refunded`) and resolved refunds/tickets cannot be modified by customers; only admins can make corrective transitions.
8. **Append-Only Audit Trail**: `/audit_logs` permits `create` and `read` for admins only; `update` and `delete` are permanently forbidden.

## 2. The Dirty Dozen Adversarial Payloads
1. **Shadow Field Injection on User Profile**: Creating `/users/{uid}` with `{ uid, email, displayName, role: "super_admin", createdAt, updatedAt }` -> MUST FAIL (`hasOnly` rejects `role`).
2. **Email Spoofing without Verification**: Request with `email: "shubhamajay65@gmail.com"` and `email_verified: false` attempting to create a product -> MUST FAIL.
3. **Cross-User PII Read**: Authenticated User B attempting `get` on `/users/userA` or `/users/userA/addresses/addr1` -> MUST FAIL.
4. **Blanket Order Scraping**: Authenticated User B attempting `list` on `/orders` without owning the matched documents -> MUST FAIL.
5. **Order Ownership Spoofing**: User A creating `/orders/ord1` with `userId: "userB"` -> MUST FAIL.
6. **Order Status Shortcutting**: Customer attempting to update their own order's `orderStatus` from `confirmed` directly to `delivered` or modifying `totalInr` -> MUST FAIL.
7. **Terminal Order Mutation**: Customer attempting to cancel an order whose `orderStatus` is already `delivered` -> MUST FAIL.
8. **Coupon Enumeration**: Non-admin attempting `list` on `/coupons` -> MUST FAIL.
9. **ID Poisoning**: Creating a document with a 500-character or special-character document ID -> MUST FAIL (`isValidId`).
10. **Timestamp Backdating**: Creating an order or review with a client-forged `createdAt` instead of `request.time` -> MUST FAIL.
11. **Review Rating Overflow**: Submitting a review with `rating: 99` or a 5000-character body -> MUST FAIL.
12. **Audit Log Tampering**: Even an admin attempting `update` or `delete` on `/audit_logs/{logId}` -> MUST FAIL.
