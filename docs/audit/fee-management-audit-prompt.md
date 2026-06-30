# Fee Management System — Audit Prompt

You are an expert financial systems auditor with deep expertise in Indian EdTech SaaS platforms, PhonePe payment gateway integrations, and PostgreSQL financial data modeling. Perform an exhaustive audit of the fee management system. Consider every line of code, every Prisma query, every edge case.

Think like a chartered accountant who also writes production code. Your goal: find every bug, every inconsistency, every race condition, every data integrity risk, every unauthorized access path, every UX failure, and every accounting blind spot before real money flows through this system.

---

## 1. DATA MODEL & SCHEMA INTEGRITY

### 1.1 Model Relationships
- Trace every `FeePayment`, `Fee`, `FeeCategory`, `FeeAssignment`, `Student`, `Organization`, `AcademicYear` relationship in `prisma/schema.prisma`
- Are all foreign keys indexed? (`@@index` or `@index`)
- Are there any missing cascade deletes that could orphan records?
- Are there any circular references or redundant relations?
- Does the `FeePayment` → `Fee` → `FeeCategory` chain properly support multi-tenant isolation?

### 1.2 Constraints & Validation
- Check every `@@unique` constraint — are there null-value collision risks (PostgreSQL treats NULLs as distinct in unique constraints)?
- Are `paidAmount` / `pendingAmount` / `totalFee` on the `Fee` model protected by **CHECK constraints** at the DB level? If not, what prevents `paidAmount + pendingAmount > totalFee`?
- Are `amount` fields `Float` or `Int` (paise)? If Float, what rounding errors exist at scale?
- Is `receiptNumber` truly unique per organization? Check the `@@unique([organizationId, receiptNumber])` constraint.

### 1.3 Enum Coverage
- Does `PaymentStatus` enum cover all states: `PENDING`, `COMPLETED`, `FAILED`, `CHEQUE_PENDING`, `CHEQUE_CLEARED`, `CHEQUE_BOUNCED`, `REFUNDED`, `PARTIALLY_REFUNDED`?
- Are there any **missing** states that should exist (e.g., `PROCESSING`, `ON_HOLD`, `CANCELLED`)?
- Check every switch/if-else on `PaymentStatus` — are all enum values handled? Any unhandled cases that silently fall through?

---

## 2. PAYMENT FLOW AUDIT (EVERY PENNY PATH)

### 2.1 Online Payment Flow (PhonePe)
- **Initiation:** Trace `PayFeeButton.tsx` → PhonePe API call → what data is sent to PhonePe? Is the amount in paise? Is the merchant ID correct?
- **Redirection:** After PhonePe checkout, where does the user land? Is there a race between the **redirect callback** (user returns to browser) and the **server-to-server callback** (PhonePe POST)?
- **Callback Handling:** Read `app/api/phonepay-callback/[transactionId]/route.ts` line by line. Does `verifyPhonePePayment()` correctly handle:
  - Duplicate callbacks (idempotency)?
  - Callback arriving before the user's redirect?
  - Callback arriving AFTER the cron has marked it FAILED?
  - Checksum verification failure? Is it logged securely (no PII)?
  - Amount mismatch between what was sent and what PhonePe returns?
- **Transaction ID Generation:** Is `transactionId` truly unique? What happens if `randomUUID()` produces a collision (astronomically unlikely, but check the code path)?
- **Double Payment Protection:** Can the same fee be paid twice online? Does the system prevent a second payment if the first is still PENDING?

### 2.2 Offline Payment Flow
- **Validation:** What validations exist on `recordOfflinePayment.ts`? Does it check:
  - That the fee isn't already fully paid?
  - That the payer is a valid student/parent in this org?
  - That the amount doesn't exceed the pending amount?
- **Transaction ID:** What happens if the admin enters a `transactionId` that already exists? Does the error message help or confuse?
- **Receipt:** Is a receipt generated immediately? Does it use the right prefix? Is the receipt number format consistent with online receipts?

### 2.3 PDC (Post-Dated Cheque) Flow
- **Recording:** `recordPdcPayment.ts` — does it validate the cheque date is in the future? Does it handle bouncing correctly?
- **Resolution:** `resolvePdcCheque.ts`:
  - When CLEARED: does it update `Fee.paidAmount` correctly? Does it generate a receipt? What receipt prefix?
  - When BOUNCED: does it revert the fee status back to pending? Does it notify the parent? Does it apply any penalty/bounce charges?
  - Can a cheque be resolved twice (double-clearing)?
- **Cheque Status Flow:** Can a CHEQUE_PENDING payment be deleted? Can it be overwritten by an online payment?

### 2.4 Payment Link Flow
- **Generation:** `generatePaymentLink.ts` — is the link scoped to a specific student and fee? Can an attacker guess other payment links?
- **Expiry:** Do payment links expire? What happens if someone uses a link after the fee is already paid?
- **Redemption:** When a parent clicks the link and pays, is the `payerId` correctly associated?

---

## 3. FINANCIAL INTEGRITY & ACCOUNTING

### 3.1 Balance Calculations
- Trace `syncFeeBalance()` in `fee-balance.ts`:
  - Does it handle `CHEQUE_PENDING` amounts correctly (not counted as paid, not counted as pending)?
  - Does it handle partial payments correctly?
  - What happens if `syncFeeBalance` is called concurrently (two payments processed at the same time)?
  - Is there a database transaction wrapping the read + write?
- Check every `Math.min()` or `Math.max()` on monetary values — are there silent caps that hide overpayments or underpayments?

### 3.2 Rounding & Precision
- Are all monetary values stored as integers (paise) or floats? If floats, enumerate every rounding error scenario.
- Platform fee calculation: `recordOnlinePayment.ts` line for `platformFee` — is it `Math.round(amount * 0.025)` or something else? Does rounding always favor the platform or the payer?
- GST calculation: if any GST logic exists, validate it against Indian GST rules (CGST + SGST split, rounding per component).

### 3.3 Refund & Overpayment
- Is there ANY refund mechanism? If so, does it restore the fee to PENDING or reduce `paidAmount`?
- Overpayment: what happens when a parent pays ₹200 for a ₹150 fee? Is the extra ₹50 tracked as credit? Lost? Sent to the school?
- Chargebacks: if a parent disputes a payment, is there any workflow to handle it?

### 3.4 Audit Trail
- Does every payment state change leave an immutable log? (`FeePaymentLog`, `AuditTrail`, or similar)
- Who changed what and when? Can an admin silently modify a payment record?
- Are `createdAt` / `updatedAt` timestamps reliable? Are they set by the DB or the app?

---

## 4. SECURITY & ACCESS CONTROL

### 4.1 Authorization on Every Action
- Check EVERY server action in `lib/data/fee/*`:
  - Does it call `auth()` and verify `orgRole`?
  - Does it verify the caller belongs to the same `organizationId` as the record being modified?
  - Can an Admin from Org A modify fees in Org B by guessing IDs?
  - Can a Student mark their own fee as paid?
- **Payment reversal:** Is there an API or server action that can reverse/delete a COMPLETED payment? Who can access it?

### 4.2 Data Leakage
- Do any API responses expose `transactionId` beyond what's necessary?
- Do any `console.log` statements leak: student names, phone numbers, email addresses, fee amounts, or receipt data?
- Check `app/api/phonepay-callback/[transactionId]/route.ts` for any response body that echoes back sensitive data.
- Is the PhonePe checksum/secret key (`SALT_KEY`) accessible from client-side code?

### 4.3 Tamper Prevention
- Can a student modify the amount field in the payment request before it reaches PhonePe?
- Is the `amount` signed or verified at any point between UI and PhonePe callback?
- Can an admin create a fake COMPLETED payment with `recordOfflinePayment.ts` without any audit?

---

## 5. BILLING & SUBSCRIPTION INTEGRATION

### 5.1 Student Count Sync
- Trace EVERY path where a student is created, deleted, or re-activated:
  - Single create (`create-student.ts`)
  - Bulk import (`action.ts`)
  - Deletion/deactivation
  - Grade promotion
- Does each path call the billing module to update student count?
- Can student count become desynchronized from actual active students?

### 5.2 Plan Limit Enforcement
- Where is `checkStudentLimit()` called? Where is it MISSING?
- What happens when a school hits their plan limit? Is there a helpful error message or a silent crash?
- Can a school on a CANCELLED/EXPIRED subscription still use the fee module?

### 5.3 Invoice ↔ Payment Sync
- Are subscription invoices and fee payments linked in any way? Or are they completely separate systems?
- Can a school pay their subscription invoice through the fee management UI?
- Is there any double-counting risk between subscription revenue and fee collection revenue?

---

## 6. NOTIFICATIONS & COMMUNICATION

### 6.1 Payment Notifications
- Does every payment state change trigger the correct notification?
  - PENDING → nothing yet (correct)
  - PENDING → COMPLETED → `PAYMENT_SUCCESS`
  - PENDING → FAILED → `PAYMENT_FAILED`
  - CHEQUE_PENDING → CHEQUE_CLEARED → `PDC_CHEQUE_RECORDED` (or similar)
  - CHEQUE_PENDING → CHEQUE_BOUNCED → `PDC_CHEQUE_BOUNCED`
- Are the WhatsApp templates for each of these created in Meta and matching the registry?
- Do the notification variables match the template parameters exactly? (Count them.)

### 6.2 Reminder Notifications
- `FEE_CREATED`, `FEE_FRIENDLY_REMINDER`, `FEE_DUE_TODAY`, `FEE_OVERDUE` — are all these triggered correctly?
- Is there throttling to prevent sending 5 reminders in one day?
- Can a parent opt out of fee reminders?

### 6.3 Receipt Delivery
- Is the receipt PDF attached to the WhatsApp `payment_success` template?
- Is the `receiptUrl` correct in every notification? Or is it removed (as we decided for PDC)?
- Does the receipt arrive via email as well? Is the email template properly styled?

---

## 7. RECEIPTS & PDF GENERATION

### 7.1 Receipt Integrity
- Are receipt numbers **strictly sequential per organization**? If not, accounting will flag this.
- Is there a `@@unique([organizationId, receiptNumber])` constraint? If yes, at the DB or Prisma level?
- Can two payments share the same receipt number?
- What prefix does each payment method use? Are they distinguishable?

### 7.2 PDF Content
- Open the receipt PDF component (`ReceiptPDF.tsx` or similar):
  - Does it show all required fields: school name, student name, receipt number, date, fee category, amount (in words + figures), payment method, transaction ID, authorized signature?
  - Is the amount-in-words correct for Indian numbering (lakhs, crores)?
  - Does it look professional on mobile?
  - Is the QR code scannable and linking to the correct verification URL?
- Is there a `ReceiptDownloadButton` that works properly?

### 7.3 Receipt Re-generation
- If a receipt PDF fails to generate, is there a retry mechanism?
- Can an admin re-generate a receipt for a historical payment?
- Is the receipt content immutable once generated? (What if the fee category name changes later?)

---

## 8. RECONCILIATION & REPORTING

### 8.1 PhonePe Settlement
- How does the system match PhonePe settlement CSVs against internal payment records?
- Is there any automated reconciliation or is it fully manual?
- What happens when PhonePe deducts a gateway fee (2.5%) — is this tracked?
- What happens when PhonePe settles a different amount than what was collected (MDR, chargebacks, reversals)?

### 8.2 Fee Reports
- Check every report in `lib/data/fee/*` and `lib/data/reports/*`:
  - Collection report: does it show gross collection, net collection, platform fees, and pending amounts correctly?
  - Daily collection report: are timezones handled correctly (IST)?
  - Fee defaulters report: does it correctly identify overdue students?
  - Class-wise collection: does it aggregate across sections correctly?
- Are all monetary values formatted with ₹ symbol and proper Indian grouping?

### 8.3 Dashboard Accuracy
- Fee dashboard widgets: are the numbers live or cached? How often do they refresh?
- Do admin dashboard fee stats match the actual payment records? (Spot-check with a manual count.)
- Are there any discrepancies between `Fee.paidAmount` and summing `FeePayment.amount`?

---

## 9. CONCURRENCY & RACE CONDITIONS

### 9.1 Double Payment
- What prevents a parent from clicking "Pay Now" twice and paying twice?
- Is there a **database-level lock** or a **transaction** that prevents concurrent payment processing for the same fee?
- Can two admins record offline payments for the same fee simultaneously?

### 9.2 Idempotency
- Is the PhonePe callback idempotent? If PhonePe sends the same callback twice (they do in production), does the second call fail gracefully or create a duplicate record?
- Is the `transactionId` the deduplication key? What if two different payments accidentally get the same `transactionId`?

### 9.3 Race with Cron
- The `updatePaymentStatus` cron at 22:30 marks all PENDING → FAILED. What if a PhonePe callback arrives at 22:31? Can it recover from FAILED → COMPLETED? Trace the code path.

---

## 10. ERROR HANDLING & EDGE CASES

### 10.1 Failure Modes
- What happens when:
  - PhonePe API is down (timeout)?
  - Database connection is lost mid-transaction?
  - PDF generation fails?
  - WhatsApp API returns 403 (template rejected)?
  - Receipt PDF generation succeeds but WhatsApp send fails?
- Are all errors surfaced to the user with actionable messages?

### 10.2 Edge Cases
- Zero-amount fee: can a school create a ₹0 fee? Can it be paid?
- Negative amounts: what if someone passes a negative payment amount?
- Student transferred to another section mid-year: how are their fee records handled?
- Student leaves school: are pending fees written off or moved to a separate ledger?
- Academic year rollover: what happens to unpaid fees from last year?
- Decimal amounts: can fees be ₹99.99 or does the system force whole rupees?

### 10.3 Data Migration
- Are there any schema changes in recent migrations that could orphan existing fee data?
- If a column was renamed or deleted, is there a rollback script?

---

## 11. UI/UX AUDIT

### 11.1 Payment Flow UX
- Open every fee-related page and component:
  - Fee listing: are pending, paid, overdue fees visually distinct?
  - Payment button: is it disabled when fee is already paid?
  - Payment status page: is the spinner/animation correct for each state?
  - Receipt download: does it work on mobile Safari? Chrome? Firefox?
- Are all amounts displayed in ₹ with proper Indian formatting (e.g., ₹1,23,456)?

### 11.2 Admin Experience
- Recording offline payment: is the form clear? Are validation errors shown inline?
- Fee creation: can the admin create fee categories, assign fees to students/grades/sections?
- Bulk fee assignment: does it work for 500+ students? Is there a progress indicator?
- Fee modification: can an admin modify a fee after it's been partially paid? (Should they?)

### 11.3 Empty States
- What does the fee page look like for a new student with no fees assigned?
- What does the fee dashboard look like for a new school with no payments?
- Are there helpful CTAs (create fee, assign fee, etc.)?

### 11.4 Mobile Responsiveness
- Test every fee page at 375px width (iPhone SE):
  - Does the table show all columns without horizontal scroll?
  - Are the action buttons (Pay, Download) tappable?
  - Is the receipt PDF readable on mobile?

---

## 12. CONFIGURATION & CONSTANTS

### 12.1 Pricing & Fees
- Are ALL prices read from `lib/constants/pricing.ts`? Any hardcoded prices anywhere?
- Is the platform fee percentage (2.5%) configurable or hardcoded?
- Is there any fee configuration that differs between development and production?
- Check `.env` for any `NEXT_PUBLIC_*` fee-related variables that might leak to the client.

### 12.2 Feature Flags
- Is PhonePe behind a feature flag? If so, what happens when the flag is off?
- Are there any half-finished fee features that should be disabled before launch? (Installment plans, GST, etc.)

---

## 13. CRON JOBS & BACKGROUND TASKS

### 13.1 Payment Status Cron
- `app/api/inngest/functions.ts` — `updatePaymentStatus`:
  - Does it have a time threshold (only fail PENDING older than N hours)?
  - Does it log how many payments were affected?
  - Is it rate-limited to avoid DB overload?
  - What happens if the cron runs twice in the same minute?

### 13.2 Fee Reminder Cron
- Is there a cron for fee reminders? If so:
  - Does it respect notification settings per org?
  - Does it throttle to avoid sending 1000 messages simultaneously?
  - Does it exclude already-paid fees?
  - Does it handle the case where WhatsApp template is not approved yet?

### 13.3 Trial Expiry Cron
- Does the trial expiry cron affect fee module access? Should it?

---

## 14. API ROUTES & WEBHOOKS

### 14.1 PhonePe Routes
- `app/api/phonepay-callback/[transactionId]/route.ts`:
  - GET vs POST: which one does PhonePe call? Which one does the browser redirect to?
  - Are both paths equally secure?
  - Is there CSRF protection on the GET endpoint?
  - Does the response leak any sensitive data to the browser?

### 14.2 Payment API Routes
- Any other fee-related API routes in `app/api/fee/*`?
- Do they all have auth checks?
- Do they all have rate limiting?

---

## 15. TESTING COVERAGE

### 15.1 What's Tested
- Are there any unit tests for fee calculations? (`__tests__/fee*` or similar)
- Are there any integration tests for the payment flow?
- Are there any tests for the cron job behavior?
- What's the test coverage percentage for fee-related code?

### 15.2 What's Not Tested
- For every untested critical path, is there at least manual QA documentation?
- Has the complete online payment flow been tested end-to-end against the PhonePe sandbox?
- Has the PDC clear/bounce flow been tested?
- Has the reconciliation report been validated against known data?

---

## DELIVERABLE

For each finding, provide:

```
## [SEVERITY: CRITICAL|HIGH|MEDIUM|LOW] — Short Title

**File:** `path/to/file.ts:line`
**Category:** [Data_Model | Payment_Flow | Security | Accounting | UX | ...]

**Description:**
Clear explanation of the issue.

**Impact:**
What happens if this isn't fixed? Money lost? Data corrupted? User blocked?

**Root Cause:**
Why does this bug exist? (Copy-paste error? Missing check? Wrong assumption?)

**Fix:**
Specific code change needed. Include the actual code diff.

**Test:**
How to verify the fix works.
```
