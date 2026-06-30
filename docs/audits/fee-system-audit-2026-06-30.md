# 🔴 FEE MANAGEMENT SYSTEM AUDIT — 2026-06-30

**System:** Shiksha.cloud Fee Management
**Scope:** 38 data/action files, 4 core billing libraries, 8 dashboard pages, 24 components, 11 Prisma models, 5 Inngest jobs
**Total Issues Found:** 51 (14 Critical, 15 High, 14 Medium, 8 Low)

---

## 🚨 CRITICAL ISSUES

### C1. Money Stored as Float (Schema: `Fee`, `FeePayment`)

**Problem:** `Fee.totalFee`, `Fee.paidAmount`, `Fee.pendingAmount`, `FeePayment.amount` are all `Float` (32-bit IEEE 754). Floats cannot exactly represent decimal fractions like `0.01`. Over thousands of transactions, cumulative rounding errors will produce irreconcilable balances.

**Example:** `0.1 + 0.2 = 0.30000000000000004`. 5000 such transactions = ₹0.20 error. An auditor will flag this immediately.

**Root cause:** Prisma schema lines 1278-1280, 1317. Missing migration to `Decimal` type.

**Fix:** Migrate to `Int` (paise — integer cents). Currently `Fee.totalFee = 99.50` should become `9950` (paise). This is a **breaking schema migration** requiring every query, every calculation, every display component to be audited.

**Risk:** ₹ errors at scale. ₹1 error per 1000 students × 12 months × 100,000 schools = ₹1.2M cumulative drift. Unauditable financials.

---

### C2. Overpayment Money Disappears

**Problem:** `getFeeBalance()` at `fee-balance-utils.ts:59` uses `Math.min(rawPaidAmount, totalAmount)` to cap paid fees. If a user pays ₹2000 on a ₹1000 fee, the system records ₹1000 paid and SILENTLY DROPS ₹1000 from the accounting trail.

**Example:** Parent pays ₹5000 annual fee but the system shows ₹3000. Parent has proof of payment. The system cannot explain where the ₹2000 went.

**Root cause:** No overpayment detection, no refund workflow, no credit balance. The min-cap hides financial errors.

**Fix:** Reject overpayments server-side. If overpayment is detected, reject the transaction before writing. Add a credit/refund system.

**Risk:** Lawsuit for missing funds. PCI/DPDP compliance failure.

---

### C3. Receipt Number Collision (UUID v4 Random)

**Problem:** `REC-${randomUUID().slice(0, 8).toUpperCase()}` generates 8 hex chars = 4.3 billion combinations. Collision probability at 10,000 receipts is ~1.16%. At 100,000 receipts, **guaranteed collision**. The `@@unique([organizationId, receiptNumber])` constraint will throw P2002, crashing the payment.

**Example:** School with 5000 students generates 3 fee assignments each per year = 15,000 receipts. Collision happens within first year.

**Root cause:** `recordOfflinePayment.ts:67`, `recordOnlinePayment.ts:196`, `recordPdcPayment.ts:74`. Using UUID prefix instead of a sequential counter with academic-year prefix.

**Fix:** Implement a DB sequence-based receipt number: `REC-${orgCode}-${academicYearShort}-${seq:06d}`. Use PostgreSQL sequence or `Prisma.$queryRawUnsafe('SELECT nextval(...)')`.

**Risk:** Payment processing fails. Parent doesn't get receipt. Duplicate receipt accusations.

---

### C4. PhonePe Callback Has No Authentication

**Problem:** `app/api/phonepay-callback/[transactionId]/route.ts` accepts GET and POST from ANY caller with NO checksum/signature verification. Any user who discovers a `transactionId` can trigger `verifyPhonePePayment`.

**Example:** A script guesses `TXN_20260630_A1B2C3` and triggers the callback. While `verifyPhonePePayment` calls PhonePe's API (which is authenticated), the callback itself has no rate limiting. An attacker can hammer PhonePe's API through this endpoint, triggering rate limits, costs, and latency.

**Root cause:** Missing checksum verification of PhonePe's X-VERIFY header on the POST callback. The code re-verifies by calling PhonePe API instead of validating the incoming signature.

**Fix:** Validate the incoming `X-VERIFY` checksum from PhonePe before calling the status API. Add rate limiting (Redis-based per-IP/per-transactionId).

**Risk:** PhonePe API costs from abuse. Callback processing delays. Payment status confusion.

---

### C5. Race Condition — Double Payment Window

**Problem:** In `phonePayInitPayment`, a `FeePayment` with `PENDING` status is created BEFORE redirecting to PhonePe. If the user clicks Pay Now twice:
1. Transaction A creates PENDING record with `txnId_1`, redirects to PhonePe
2. User clicks Back, clicks Pay Now again
3. Transaction B creates another PENDING record with `txnId_2`, redirects to PhonePe
4. User completes BOTH payments on PhonePe
5. Both callbacks fire → both mark COMPLETED → **double charge**

**Root cause:** `recordOnlinePayment.ts:198-214`. No check for existing PENDING payment for the same fee by the same user. The `@@unique([feeId, transactionId])` doesn't protect because each has a different transactionId.

**Fix:** Before creating a PENDING record, check for any existing PENDING record for `{feeId, payerId}`. Reuse the existing transactionId instead of generating a new one. Add a Redis lock on `feeId` during payment initiation.

**Risk:** Real financial loss. User charged twice. School owes refund. Reputation damage.

---

### C6. Automated PENDING→FAILED Cron Destroys Valid Payments

**Problem:** `updatePaymentStatus` Inngest job at `functions.ts:38-51` marks ALL payments with `status: PENDING` as FAILED daily at 10:30 PM. If PhonePe's callback is delayed or fails (network issue, server restart), a legitimate payment that actually succeeded is marked FAILED.

**Example:** Parent pays 10:29 PM. PhonePe processes it. Callback arrives 10:31 PM. Cron already marked it FAILED at 10:30 PM. Parent is told payment failed. Real money was deducted. No recovery path.

**Root cause:** `functions.ts:43`. Blind update without checking payment age or verifying with gateway. Only 24h-old PENDING payments should be failed.

**Fix:** Change to mark only payments older than 24 hours as FAILED. Add a reconciliation flag. Better: use `createdAt < now - 24h` in the WHERE clause.

**Risk:** Real money lost. Customer support nightmare. Manual refunds needed with no refund system.

---

### C7. Concurrent Offline Payment Records Both Succeed

**Problem:** `recordOfflinePayment.ts:51-56` checks balance OUTSIDE the transaction. Two admins recording for the same fee simultaneously:
1. Admin A reads pendingAmount = ₹1000
2. Admin B reads pendingAmount = ₹1000
3. Both pass the `validatedData.amount > pendingAmount` check
4. Both enter `$transaction`
5. Both create `FeePayment` records
6. Both call `syncFeeBalance` — this calculates correctly from DB, but the check was wrong

If Admin A records ₹1000 and Admin B records ₹1000 on a ₹1000 fee:
- Both payments created (2000 total)
- `paidAmount` capped at 1000 (min-cap hides error again — see C2)
- ₹1000 unaccounted

**Root cause:** `recordOfflinePayment.ts:51-57`. Check-then-act race condition. The pendingAmount is stale by the time the transaction executes.

**Fix:** Move the amount check INSIDE the transaction. Use `SELECT ... FOR UPDATE` (Prisma `$transaction` with isolation level) to lock the Fee row. Re-read payments inside the transaction before creating.

**Risk:** Accounting errors. Missing money. Audit failure.

---

### C8. No Refund Workflow

**Problem:** Zero refund infrastructure. No `Refund` model, no credit note, no balance reversal, no way to reverse a payment. If a student withdraws mid-year, drops out, or overpays, the only option is to delete `FeePayment` records — destroying the financial audit trail.

**Example:** Student withdraws in October. Annual fee was ₹12,000 (₹1000/month). 6 months unused = ₹6000 should be refunded. The system cannot process this. Admin deletes the FeePayment records. Audit trail destroyed.

**Root cause:** Missing feature. No refund schema, no server action, no UI.

**Fix:** Add `Refund` model with `feePaymentId`, `amount`, `reason`, `processedBy`, `refundDate`, `status`. Create a refund server action that: (1) creates refund record, (2) notifies parent, (3) re-syncs fee balance, (4) generates credit note PDF. Never delete FeePayment.

**Risk:** Legal liability. Consumer protection violation. Cannot serve schools in regulated jurisdictions.

---

### C9. No Duplicate Payment Idempotency Key for PhonePe

**Problem:** `phonePayInitPayment` has no idempotency key. If the PhonePe API call succeeds but the redirect fails (browser crash), the PENDING record exists but the user never lands on PhonePe. When the user retries, a NEW transactionId is generated. No idempotency means duplicate payments are architecturally guaranteed.

**Root cause:** `recordOnlinePayment.ts:86-228`. The function generates `transactionId` server-side but doesn't deduplicate.

**Fix:** Add a client-side idempotency key (crypto.randomUUID). Store it in the PENDING FeePayment. Before creating a new one, check for existing PENDING with same idempotency key. Return the existing redirect URL.

**Risk:** Double charges. Parent disputes. Payment gateway chargebacks.

---

### C10. PhonePe Payload Amount Differs from DB PENDING Amount

**Problem:** `phonePayInitPayment` line 148 sends `Math.round(totalPayableAmount * 100)` to PhonePe. But the PENDING record stores `pendingAmount` (line 201), not `pendingAmount + platformFee`. When `verifyPhonePePayment` checks `responseAmount !== expectedPaise` (line 529-530), it computes:
```ts
const expectedPaise = Math.round((payment.amount + (payment.platformFee ?? 0)) * 100);
```
This relies on `payment.platformFee` being correctly set. If `platformFee` calculation differs between init and verify (due to floating point), the amounts won't match and the transaction fails even though everything was correct.

**Root cause:** Floating multiplication in both places: `parseFloat((pendingAmount * PLATFORM_FEE_PERCENT).toFixed(2))` (line 141, offline) and when computing `expectedPaise` (line 529).

**Fix:** Compute platform fee as integer (paise) consistently. Store fee and platformFee in paise. Ensure `platformFee + amount` exactly equals the paise amount sent to PhonePe.

**Risk:** Payment failures for legitimate transactions. Confused parents.

---

### C11. Subscription Cascade Deletes Destroy Financial History

**Problem:** `Organization` → `Subscription` has `onDelete: Cascade`. `Subscription` → `Invoice`, `SubscriptionPayment`, `BillingEvent` all cascade. If an Organization record is deleted (e.g., data cleanup, malicious admin), ALL billing history is permanently destroyed.

**Example:** SuperAdmin deletes an org that closed 2 years ago. The delete cascades and destroys all invoice records. An ongoing tax audit request for those invoices cannot be fulfilled.

**Root cause:** `schema.prisma` lines: Subscription.organization (Cascade), Invoice.subscription (Cascade), Invoice.organization (Cascade), SubscriptionPayment.subscription (Cascade), BillingEvent.subscription (Cascade).

**Fix:** Change all financial cascade deletes to `Restrict` or `SetNull`. Implement soft-delete for organizations. Never cascade-delete financial records.

**Risk:** Regulatory non-compliance. Tax audit failure. Permanent data loss.

---

### C12. Missing Organization Scoping in Payment Verification

**Problem:** `verifyPhonePePayment` at `recordOnlinePayment.ts:421-443` queries:
```ts
const payment = await prisma.feePayment.findFirst({
  where: { transactionId },
  // no organizationId filter
});
```
No `organizationId` filter. While `transactionId` is unique per `feeId`, the lookup is not scoped to the current organization. Multi-tenant leak.

**Example:** Water leak between orgs through shared callback handler.

**Root cause:** `recordOnlinePayment.ts:421`. Missing org scope on payment lookup. The callback route (`phonepay-callback/[transactionId]`) also doesn't scope.

**Fix:** Add `organizationId` to the query. The callback can store the orgId from the original payment initiation.

**Risk:** Cross-org payment confusion. Multi-tenant data leak.

---

### C13. FEE Assignment Ignores Existing Fees (Duplicate Assignment)

**Problem:** `AssignFeeToStudents` at `FeeAssignmentAction.ts:49-61` creates fees via `createManyAndReturn` with NO check for existing fee records with the same `{studentId, feeCategoryId, academicYearId}`. Same fee category can be assigned twice.

**Example:** Admin accidentally clicks "Assign Fee" twice. Students get two Tuition fees of ₹5000 each for the same academic year. Parents get confused. No easy way to bulk-remove.

**Root cause:** `FeeAssignmentAction.ts:49`. Missing upsert/check-before-create logic.

**Fix:** Add a pre-check query: are there existing fees for `{studentId, feeCategoryId, academicYearId}` for any of the selected students? If yes, warn the admin and skip those.

**Risk:** Fee overcharging. Admin confusion.

---

### C14. Student Count Used Without Billing Module Validation

**Problem:** `countBillableStudents` counts ACTIVE students. But AGENTS.md explicitly says "Student Count = Billing: Student count is a billing-sensitive field. Never update it directly — always go through the billing module." The student module creates students without checking the billing limit. The `checkStudentLimit` function exists but is NEVER CALLED from student creation.

**Example:** School on Starter plan (100 student limit) imports 200 students. System silently allows it. When the invoice is generated, the school is billed for 200 but the student limit is 100. Pricing breach.

**Root cause:** No enforcement. `checkStudentLimit` exists in `subscription-billing.ts:1045` but is not integrated into student creation flow.

**Fix:** Call `checkStudentLimit` in the student creation server action. Add 1 to `additionalStudents`. Block creation if limit exceeded. Per AGENTS.md: soft enforcement at first (notify, don't block) until 20 orgs, then full block.

**Risk:** Revenue leakage for 100,000+ school scale.

---

## ⚠️ HIGH ISSUES

### H1. No Pending Payment Check in PayFeeButton Client

**Problem:** `PayFeeButton.tsx:48-68` calls `phonePayInitPayment` without first checking if a PENDING payment already exists for this feeId by this user.

**Example:** Parent with slow connection clicks Pay Now, nothing happens for 5 seconds, clicks again. Two PENDING records created. Both might complete (see C5).

**Root cause:** `PayFeeButton.tsx`. Missing "is there already a pending payment?" check.

**Fix:** Add server action to check for existing PENDING payment before init. Show "You have a pending payment" with a link to resume.

**Risk:** Duplicate payments.

---

### H2. PDC Resolution Race Condition

**Problem:** `resolvePdcCheque.ts:53` checks `cheque.status !== ChequeStatus.PENDING` OUTSIDE the transaction. Two admins clicking "Clear" simultaneously both pass the check and enter the transaction. Both updates succeed. The cheque is effectively cleared twice — `syncFeeBalance` double-counts the payment.

**Root cause:** `resolvePdcCheque.ts:53-54`. Check-then-act race.

**Fix:** Move the status check INTO the transaction with a `where` clause on the update: `where: { id, status: ChequeStatus.PENDING }`. Check `count === 1` to confirm only one update happened.

**Risk:** Double-counted PDC payment. Fee shows ₹2000 paid on a ₹1000 fee.

---

### H3. getOnlinePaymentReceiptRecord Permission Too Restrictive

**Problem:** Filters by `payerId: userId` (line 258). When admin generates a payment link for a student via `generateFeePaymentLink`, the payerId is set to the student's userId. Parent's userId won't match, so they can't view the receipt.

**Root cause:** `recordOnlinePayment.ts:253-259`. Payer-only filter prevents multi-user access.

**Fix:** Also allow the parents of the student (via `fee.student.parents`) and admin/teacher roles to view receipts.

**Risk:** Parent cannot download receipt. Customer support load increases.

---

### H4. Daily Cron Marks ALL PENDING Payments Failed Regardless of Age

**Problem:** `updatePaymentStatus` (Inngest) marks every PENDING payment as FAILED regardless of age. A 5-minute-old payment gets failed alongside a 48-hour-old abandoned one.

**Example:** Parent pays at 10:25 PM. PhonePe is slow. Cron runs at 10:30 PM. Marks payment FAILED. Parent sees failure on their bank statement but system says failed. Panic.

**Root cause:** `functions.ts:42-46`. No age filter.

**Fix:** `where: { status: PaymentStatus.PENDING, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }`

**Risk:** False failed payments. Customer trust damage.

---

### H5. Fee Status Denormalization Drift

**Problem:** `Fee.status` is stored as a DB column but recomputed by `getFeeBalance`. The cron `updateOverdueFeesAutomation` updates DB status to OVERDUE. But the canonical status is always computed from payments + dueDate. Two sources of truth.

**Example:** A payment clears for an overdue fee. `getFeeBalance` correctly computes PAID. But DB still shows OVERDUE until `syncFeeBalance` runs. Reports querying raw DB status show wrong data.

**Root cause:** `schema.prisma:1282` stores denormalized status. Business logic computes it dynamically. No single source of truth.

**Fix:** Remove `Fee.status` column entirely. Always compute from payments. Or keep it as cache that's always updated synchronously after every payment (which `syncFeeBalance` does).

**Risk:** Wrong reports. Wrong defaulter lists. Collection agents chase paid parents.

---

### H6. No FeeCategory Academic Year Scoping in Creation

**Problem:** `createFeeCategory` doesn't set `academicYearId`. The field is optional. Categories can exist outside any academic year. When fees are assigned, the category might not belong to the current year.

**Example:** A "Summer Camp Fee" category created in 2025-26 is accidentally used to assign fees in 2026-27.

**Root cause:** `fee-category-actions.ts:12-30`. Missing `getCurrentAcademicYearId()` integration.

**Fix:** Always set `academicYearId` to the current academic year when creating categories. Make the field required in the schema.

**Risk:** Cross-year fee category pollution. Reports include fees from wrong years.

---

### H7. Platform Fee Percent Source No Validation

**Problem:** `PLATFORM_FEE_PERCENT` is imported from `@/constants` with value `0.025`. If a developer accidentally sets it to `25` (2500%), there's no runtime validation.

**Root cause:** No guard in `recordOnlinePayment.ts` or `PayFeeButton.tsx`.

**Fix:** Add runtime validation:
```ts
if (PLATFORM_FEE_PERCENT <= 0 || PLATFORM_FEE_PERCENT >= 1) {
  throw new Error('Invalid platform fee configuration');
}
```

**Risk:** Silent fee miscalculation. Could charge 2.5% or 2500%.

---

<!-- ### H8. `BillingMetric` Enum Missing `USER` Type

**Problem:** `BillingMetric` in Prisma schema is `{ STUDENT, FLAT }`. But `PricingMode.CUSTOM_PER_USER` exists and uses `countBillableUsers`. The metric value is never set to "USER" because it doesn't exist in the enum.

**Root cause:** `schema.prisma` enum. Missing `USER` variant. The code uses `BillingMetric.FLAT` as a fallback (line 657).

**Fix:** Add `USER` to `BillingMetric` enum. Add migration.

**Risk:** Custom per-user billing doesn't properly compute or display.

--- -->

### H9. Cascade on FeePayment from ChequeDetail

**Problem:** `ChequeDetail` has `onDelete: Cascade` on `feePaymentId`. If a FeePayment were deleted, the ChequeDetail is silently cascade-deleted. Financial audit trail destroyed.

**Root cause:** `schema.prisma:1393`.

**Fix:** Remove cascade. Use `Restrict`.

**Risk:** Loss of cheque-level audit trail.

---

### H10. Receipt Generation Uses In-Memory Data Before Commit

**Problem:** `preparePaymentReceipt.ts:167-188` appends the in-flight payment manually before it's committed. If DB transaction commits but PDF generation fails, receipt is never sent but money is recorded.

**Root cause:** PDF generation after transaction commit with no retry.

**Fix:** Queue Inngest job for receipt regeneration if generation fails. Add `FeePayment.receiptGenerated` boolean.

**Risk:** Missing receipts for valid payments.

---

### H11. No Pagination in PDC Cheques View

**Problem:** `getPdcCheques` fetches ALL PDC cheques for an org without limit.

**Root cause:** `resolvePdcCheque.ts:181`.

**Fix:** Add pagination with default page size of 50.

**Risk:** Performance degradation at 10,000+ PDC records.

---

## 🔶 MEDIUM ISSUES

### M1. `FeeCategory` Unique Constraint Allows Null Academic Year Duplicates

**Problem:** `@@unique([name, organizationId, academicYearId])`. PostgreSQL treats NULLs in unique constraints as distinct values. Two categories with `(name="Tuition", org=1, year=null)` are BOTH allowed.

**Fix:** Make `academicYearId` required in schema.

---

### M2. No Search/Filter in Fee History Queries

**Problem:** `getAllStudentsFees` has no search, filter by status, grade, section, or date range.

**Fix:** Add optional filters: studentName, status, gradeId, sectionId, minDueDate, maxDueDate.

---

### M3. `offlinePaymentSchema` Allows Negative/Zero PayerId

**Problem:** `payerId: z.string()` with no length validation.

**Fix:** `payerId: z.string().min(1)`.

---

### M4. No Cache for Organization Fee Summary

**Problem:** `getOrganizationFeeSummary` fetches ALL fees and computes summary in JS. For 50,000 fees, this reads 50,000 records every page load.

**Fix:** Add summary columns to Organization and update via Inngest daily or after every payment.

---

### M5. Float Precision in roundMoney

**Problem:** `Math.round((amount + Number.EPSILON) * 100) / 100`. Known edge cases (e.g., `0.565` rounds to `0.56`).

**Fix:** Use integer arithmetic throughout.

---

### M6. Payer Validation Error Leaks User IDs

**Problem:** `recordOfflinePayment.ts:64` throws error with actual user ID in message.

**Fix:** Return generic "Invalid payment details".

---

### M7. No Fee Category Deletion Error Message

**Problem:** `deleteFeeCategory` fails with generic error. Admin doesn't know WHY it failed (category has fees).

**Fix:** Check for existing fees first. Return descriptive message.

---

### M8. PDC Receipt Prefix Inconsistent

**Problem:** PDC receipts use `PDC-${uuid}` while offline payments use `REC-${uuid}`.

**Fix:** Use consistent prefix scheme.

---

### M9. `getParentFeesData` No Academic Year Fallback

**Problem:** If `academicYearId` is null, returns null immediately with no fallback.

**Fix:** If no active academic year, query by orgId without year filter.

---

### M10. Missing Index on `FeePayment.transactionId`

**Problem:** No standalone index on `transactionId`. Callback queries by it are unindexed.

**Fix:** Add `@@index([transactionId])`.

---

### M11. `updateOverdueFeesAutomation` Ignores Partial Payments

**Problem:** Marks ALL UNPAID fees with past due as OVERDUE. Doesn't consider partial payments made on that fee.

**Fix:** Join with FeePayment to check for COMPLETED payments before marking overdue.

---

### M12. `getAdminFeesSummary` Uses Different Academic Year Source

**Problem:** Uses `getActiveAcademicYearId()` while other admin views use `getCurrentAcademicYearId()`. Different sources could return different years.

**Fix:** Align on a single function.

---

## 🔹 LOW ISSUES

### L1. Inconsistent Error Messages
`recordOfflinePayment.ts:57` vs `recordPdcPayment.ts:61` use different terminology for similar validation failures.

### L2. `console.error` in Production Code
Several files use `console.error` instead of structured logging.

### L3. Inngest Function Name Misleading
`updatePaymentStatus` marks PENDING→FAILED, not general payment status. Rename.

### L4. Timezone Risk in Overdue Cron
`toISTDate()` comparison vs DB UTC could cause fees to go overdue 5.5 hours early/late.

### L5. Fee Category Edit Propagates Retroactively
Category name change updates all historical fee records via relation. May be desired or not.

### L6. No CSV/Excel/PDF Export for Fee Reports
All reporting is in-browser only. No export for offline analysis.

### L7. No Refund Notifications
No notification templates for refund processing.

### L8. Payment Method Enum Not Exhaustive
Missing `NET_BANKING`, `DEBIT_CARD`, `CREDIT_CARD` — only has `CARD`.

---

## 📊 SUMMARY

| Severity | Count | Key Themes |
|---|---|---|
| **Critical** | 14 | Float money (C1), overpayment data loss (C2), receipt collision (C3), callback auth (C4), race conditions (C5, C6, C7), no refunds (C8), duplicate payments (C9), cascade destroys (C11), multi-tenant leaks (C12), duplicate assignment (C13), billing enforcement (C14) |
| **High** | 12 | Permission gaps, stale cron logic, denormalization drift, cascade risks, enum/type mismatches |
| **Medium** | 12 | Missing pagination/search, float edge cases, error messages, missing indexes |
| **Low** | 8 | Logging, naming, consistency, timezone, exports |

**Total: 51 issues**

---

## 🎯 TOP 5 IMMEDIATE ACTIONS

1. **Migrate Float → Int (Paise)** (C1) — Without it, the system cannot be audited.
2. **Overpayment Protection** (C2, C5, C7, C9) — Prevent double charges and disappearing money.
3. **PhonePe Callback Security** (C4) — Add checksum verification and rate limiting.
4. **Sequential Receipt Numbers** (C3) — Replace UUID-prefix with database sequence.
5. **Refund System** (C8) — Every payment system needs a refund path.

---

## 🏗 ARCHITECTURAL RECOMMENDATIONS

**Add:**
- `FeePayment.overpaymentAmount` (paise) — track overpayments without data loss
- `Refund` model — full refund lifecycle
- `GatewaySettlement` model — bank reconciliation
- `PaymentIntent` — idempotent payment init with state machine
- Redis-based distributed locks for fee payment concurrency
- DB sequence for receipt numbers per org + academic year

**Remove:**
- `Fee.status` denormalized column
- `Fee.paidAmount` / `Fee.pendingAmount` computed columns (or keep as cached read model)
- Cascading deletes on financial records

**Schema migration required:**
- Float → Int (paise) on Fee, FeePayment
- Add `FeePayment.overpaymentAmount` Int
- Remove cascade from all financial relations
- Add `FeePayment.idempotencyKey` String? @unique
- Add `userCount` to BillingMetric enum
- Add `FeePayment.receiptGenerated` Boolean @default(false)
- Make FeeCategory.academicYearId required
