# Fee Management V1 - Single Source of Truth Refactor PRD

**Status:** Draft  
**Date:** 2026-05-30  
**Owner:** Solo dev  
**Project:** Shiksha fee management launch hardening

---

## 1. Problem and Context

The current fee management system already has the core launch workflow: assign fees, collect online/offline/PDC payments, show student/parent/admin fee pages, generate receipts, and power dashboard summaries.

The risk is not missing features. The risk is financial inconsistency.

Before this refactor, fee amount logic was repeated across pages and server actions. Some places trusted `Fee.paidAmount`, some used `Fee.pendingAmount`, and others recalculated from payment records. That makes one school see different fee totals depending on whether they open the admin assignment page, student payment page, parent dashboard, teacher summary, reports, or receipt flow.

For V1, the fee system must stay simple and reliable:

- Keep the current models: `FeeCategory`, `Fee`, `FeePayment`, and `ChequeDetail`.
- Treat completed `FeePayment` rows as the source of paid amount truth.
- Derive fee balance through one shared function.
- Persist `Fee.paidAmount`, `Fee.pendingAmount`, and `Fee.status` only as synced mirrors for compatibility and fast reads.
- Keep admin, student, parent, and teacher pages consistent.
- Avoid introducing future financial modules before the base accounting is trustworthy.

**Why now:** This is the launch version. Schools can tolerate fewer advanced features in V1, but they cannot tolerate wrong pending balances, double counted payments, or inconsistent status labels.

---

## 2. Product Goal

Ship a fee management V1 where every role sees the same answer for:

- Total assigned fee
- Paid amount
- Pending amount
- Fee status
- Overdue amount
- Payment history
- Receipt amount

The system should be boring in the best way: one fee, one balance, one truth.

---

## 3. Non-Goals for V1

Do not add these now:

- GST or GST+ invoice logic
- Discounts
- Scholarships
- Waivers
- Fine or late penalty engine
- Installment engine
- Fee template redesign
- Ledger/accounting module
- Settlement automation
- Refund UI
- Advanced reconciliation dashboards

These can be added later only after the V1 balance model is stable.

---

## 4. Current Model

### FeeCategory

Defines the school-defined fee type, such as tuition, exam, transport, lab, yearly fee, or custom categories.

### Fee

Represents one assigned fee for one student in one organization and academic year.

Fields used in V1:

- `totalFee`: assigned amount
- `paidAmount`: synced mirror of completed payments
- `pendingAmount`: synced mirror of remaining amount
- `dueDate`: due date used for overdue status
- `status`: synced mirror derived from balance rules
- `studentId`, `feeCategoryId`, `organizationId`, `academicYearId`

### FeePayment

Represents each payment attempt or payment record against a fee.

Fields used in V1:

- `amount`: fee amount credited when payment is completed
- `status`: payment lifecycle state
- `paymentMethod`: cash, UPI, card, bank transfer, cheque, or online
- `receiptNumber`
- `transactionId`
- `payerId`
- `platformFee`: current online payment charge field
- `organizationId`

### ChequeDetail

Tracks PDC cheque metadata and resolution state. PDC amount should not count as paid until the cheque is cleared and the linked `FeePayment` becomes `COMPLETED`.

---

## 5. Single Source of Truth

### Rule

The canonical fee balance is:

```ts
paidAmount = sum(FeePayment.amount where status === COMPLETED)
dueAmount = max(Fee.totalFee - paidAmount, 0)
```

All fee pages, dashboards, summaries, receipts, reminders, payment actions, and reports must use the shared balance helper instead of reimplementing this calculation.

### Canonical Helper

File:

```txt
lib/data/fee/fee-balance.ts
```

Required functions:

- `getFeeBalance(fee, now?)`
- `getFeesSummary(fees, now?)`
- `getStudentFeeSummary(studentId, now?)`
- `getOrganizationFeeSummary(organizationId, academicYearId, now?)`
- `syncFeeBalance(feeId, client?)`
- `syncOrganizationFeeBalances(organizationId, academicYearId, client?)`

### Status Rules

For V1, keep the existing `FeeStatus` enum:

- `PAID`
- `UNPAID`
- `OVERDUE`

Status derivation:

- `PAID`: `dueAmount === 0`
- `OVERDUE`: `dueAmount > 0` and `dueDate < now`
- `UNPAID`: `dueAmount > 0` and fee is not overdue

Partial payments are supported by amount calculation, but not by adding a new enum in V1. A partially paid fee remains `UNPAID` or `OVERDUE` until fully paid, while the UI shows paid and pending amounts clearly.

---

## 6. Scope

### In Scope

1. Centralize all fee balance calculation in `fee-balance.ts`.
2. Refactor existing fee stats, role dashboards, receipts, and pay pages to read canonical balances.
3. Update payment writes to call `syncFeeBalance()` after completed, failed, bounced, or cancelled payment state changes.
4. Ensure all fee reads are scoped by `organizationId` and active `academicYearId` where applicable.
5. Keep PDC payments separate from paid totals until cheque clearance.
6. Keep online payment platform fee handling only where it already exists.
7. Keep current UI pages and flows, but ensure they display the same pending/paid numbers.
8. Improve naming consistency for fee functions and payment pages.
9. Add lightweight verification scripts for balance calculation and usage.

### Out of Scope

Anything that requires a new financial model, a new fee calculation concept, or a new business policy is out of scope for this PRD.

---

## 7. User Stories

### Admin

As an admin, I can assign a fee to students and later see the same paid, pending, and overdue values across the fee assignment page, fee detail page, dashboard cards, and reports.

### Student

As a student, I can open my fee page and see the exact amount pending before I pay. If I have paid partially offline, the page shows the reduced pending amount.

### Parent

As a parent, I can view each child's fees and trust that pending totals match receipts and payment history.

### Teacher

As a teacher, I can see class fee summaries without stale totals or cross-organization data.

### Accountant/Admin Operator

As an operator, I can record offline or PDC payments without manually calculating the remaining balance. The system derives it after each payment event.

---

## 8. Functional Requirements

### FR1 - Canonical Balance Calculation

All balance calculation must use `getFeeBalance()` or `getFeesSummary()`.

Acceptance criteria:

- No fee page manually calculates `totalFee - paidAmount` when a canonical balance is available.
- Completed payments are the only payments counted toward paid amount.
- PDC payments in `CHEQUE_PENDING` do not reduce pending amount.
- Failed, cancelled, refunded, unpaid, and pending payments do not reduce pending amount.

### FR2 - Synced Mirror Fields

`Fee.paidAmount`, `Fee.pendingAmount`, and `Fee.status` are kept for compatibility, but must be updated through `syncFeeBalance()`.

Acceptance criteria:

- `recordOfflinePayment()` calls `syncFeeBalance()` inside the transaction after creating a completed payment.
- `verifyPhonePePayment()` calls `syncFeeBalance()` after online payment completion or failure handling.
- `resolvePdcCheque()` calls `syncFeeBalance()` after clear, bounce, or cancel.
- No payment flow updates `paidAmount`, `pendingAmount`, or `status` with custom inline math.

### FR3 - Pay Page Consistency

The student and parent pay pages must use canonical pending amount.

Acceptance criteria:

- Pay button amount equals `getFeeBalance(...).dueAmount`.
- Receipt amount equals the completed payment record.
- Paid fees show receipt download instead of pay action.
- Unpaid or overdue fees show pay action with current pending amount.

### FR4 - Admin Fee Assignment Consistency

The admin assignment page must display canonical fee status and amounts.

Acceptance criteria:

- Each listed fee row maps through `getFeeBalance()`.
- Displayed paid amount, pending amount, and status match payment history.
- Filters and tabs still work with the current route structure.

### FR5 - Dashboard Summary Consistency

Admin, institution, parent, student, teacher, and AI fee summaries must read from the same summary semantics.

Acceptance criteria:

- Total fees = sum of `Fee.totalFee`.
- Collected fees = sum of completed `FeePayment.amount`, capped at assigned total per fee.
- Pending fees = sum of derived due amounts.
- Overdue fees = sum of due amounts where due date has passed.

### FR6 - Naming Convention

Fee domain functions should use clear action names.

Preferred naming:

- Read one balance: `getFeeBalance`
- Read many balances: `getFeesSummary`
- Persist one balance mirror: `syncFeeBalance`
- Persist org balances: `syncOrganizationFeeBalances`
- Record offline payment: `recordOfflinePayment`
- Start online payment: `phonePayInitPayment`
- Verify online payment: `verifyPhonePePayment`
- Record PDC payment: `recordPdcPayment`
- Resolve PDC cheque: `resolvePdcCheque`

Avoid new vague names such as `calculateData`, `updateFee`, `handlePayment`, `doFee`, or `paymentUtils`.

### FR7 - App Router Page Convention

Keep the existing Next.js App Router route convention. Fee pages stay as route `page.tsx` files under `app/dashboard/fees/...`.

Relevant pages:

- `app/dashboard/fees/student/page.tsx`
- `app/dashboard/fees/admin/assign/page.tsx`
- `app/dashboard/fees/admin/fee-categories/page.tsx`
- `app/dashboard/students/[id]/page.tsx`

Acceptance criteria:

- Route components load data server-side where practical.
- Client payment controls receive already-derived canonical amounts.
- No duplicate fee calculation logic is hidden in client components.

---

## 9. Technical Requirements

### Data Access

- Fee reads that affect school data must include `organizationId`.
- Academic-year-scoped screens must include the active `academicYearId`.
- Student and parent views must validate the requested fee belongs to the current user context.

### Transactions

Payment state changes must update payment records and sync the fee balance in the same transaction where possible.

### Rounding

Money calculations should round to two decimal places in the balance helper. UI formatting should use existing Indian currency utilities.

### Overpayment

Paid amount should be capped at `totalFee` for displayed fee balance. Overpayment handling is not a V1 product feature and should not be introduced in this PRD.

---

## 10. Git Status Enhancement Map

The current working tree already points to this refactor. These changes belong to the PRD scope:

| Area | Files |
| --- | --- |
| Canonical balance helper | `lib/data/fee/fee-balance.ts` |
| Admin fee summary | `lib/data/fee/get-admin-fee-stats.ts` |
| Fee reads and role dashboards | `lib/data/fee/get-all-students-fees.ts`, `lib/data/fee/get-parent-fees-data.ts`, `lib/data/fee/get-parent-fees-stats.ts`, `lib/data/student/get-fees-status.ts`, `lib/data/teacher/get-teacher-fee-summary.ts` |
| Payment actions | `lib/data/fee/recordOfflinePayment.ts`, `lib/data/fee/recordOnlinePayment.ts`, `lib/data/fee/recordPdcPayment.ts`, `lib/data/fee/resolvePdcCheque.ts` |
| Receipts | `lib/data/fee/preparePaymentReceipt.ts`, `lib/pdf-generator/StudentReportPDF.tsx` |
| Pay and fee pages | `app/dashboard/fees/student/page.tsx`, `app/dashboard/fees/admin/assign/page.tsx`, `app/dashboard/students/[id]/page.tsx` |
| Fee UI components | `components/dashboard/Fees/FeeAssignmentDataTable.tsx`, `components/dashboard/Fees/FeeAssignmentFilter.tsx`, `components/dashboard/Fees/StudentPaymentHistoryTable.tsx`, `components/dashboard/Fees/Recordpdcpaymentcard.tsx` |
| Verification scripts | `tools/fee/*`, `package.json` scripts |

---

## 11. Verification

### Automated Checks

Run:

```bash
npm run test:fee-balance
npm run check:fee-balance
npm run type-check
npm run build
```

### Manual Test Flows

1. Assign a fee to a student.
2. Open admin assignment page and verify total, paid, pending, and status.
3. Open student fee page and verify pending amount matches admin page.
4. Record a partial offline payment and verify pending amount decreases everywhere.
5. Record the remaining offline payment and verify status becomes `PAID`.
6. Initiate online payment and verify the pay amount uses current pending amount.
7. Record a PDC cheque and verify pending amount does not decrease while cheque is pending.
8. Clear the PDC cheque and verify pending amount decreases.
9. Bounce or cancel a PDC cheque and verify fee balance remains unchanged.
10. Download receipt and verify amount matches the payment record.

---

## 12. Success Metrics

The refactor is successful when:

- One fee shows the same paid and pending amount across all fee pages.
- There is no custom balance math outside the canonical helper path.
- Payment writes no longer hand-update fee mirror fields with duplicated logic.
- Student, parent, teacher, admin, and report views agree on totals.
- V1 launches without adding GST, discounts, scholarships, fines, penalties, or new fee models.

---

## 13. Open Decisions

No product expansion decisions are needed for V1.

Future PRDs can decide:

- GST receipts
- Discount and scholarship model
- Fine and penalty rules
- Installments
- Settlement reconciliation
- Refund UI and refund accounting

These should remain separate from this launch refactor.
