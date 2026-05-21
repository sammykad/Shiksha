# Fee Management Module — Pre-Production Security Audit

**Date:** 2026-04-12
**Auditor:** Qwen Code (AI)
**Stack:** Next.js 16, Prisma 7, PostgreSQL, Clerk Auth, Upstash Redis, Server Actions
**Models:** Fee, FeePayment, FeeCategory

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 3     |
| High     | 6     |
| Medium   | 6     |
| Low      | 1     |
| **Total**| **16**|

**Recommendation:** DO NOT ship to production until all Critical and High severity bugs are resolved.

---

## 1. RACE CONDITIONS

### BUG #1 — Duplicate FeePayment from Concurrent Payment Submissions
**FILE:** `lib/data/fee/recordOnlinePayment.ts` — `phonePayInitPayment()`
**SEVERITY:** critical

**DESCRIPTION:**
`phonePayInitPayment` creates a `FeePayment` record with status `PENDING` after receiving a successful response from PhonePe. If the user double-clicks Pay Now, the browser retries, or both the callback endpoint (POST) and the user's redirect (GET) fire simultaneously, two `FeePayment` rows with different `receiptNumber` and `transactionId` are created for the same `feeId`. There is no unique constraint on `(feeId, transactionId)` or any optimistic locking mechanism to prevent duplicates.

**FIX:**
```prisma
// prisma/schema.prisma — add unique constraint
model FeePayment {
  // ...existing fields
  @@unique([feeId, transactionId])
  @@unique([receiptNumber]) // already exists
}
```

```ts
// lib/data/fee/recordOnlinePayment.ts — phonePayInitPayment
// Replace .create() with .upsert() for idempotency
await prisma.feePayment.upsert({
  where: { feeId_transactionId: { feeId: fee.id, transactionId } },
  create: { /* ...existing data... */ },
  update: {}, // no-op if exists
});
```

---

### BUG #2 — Double Notification/Receipt from Concurrent Callback Handlers
**FILE:** `lib/data/fee/recordOnlinePayment.ts` — `verifyPhonePePayment()`
**SEVERITY:** critical

**DESCRIPTION:**
The PhonePe callback (`GET /api/phonepay-callback/:transactionId`) and the POST webhook can fire simultaneously. Both call `verifyPhonePePayment()`. The function loads the payment, checks `payment.status === COMPLETED` (idempotency guard), then calls `prisma.$transaction()`. The tx re-reads inside (`current = await tx.feePayment.findUnique`), which is good — but the `alreadyCompleted` flag only prevents DB writes. It does NOT prevent the receipt generation and `notify.fee.paymentSuccess()` from running twice. This results in:
- Duplicate email/WhatsApp notifications to the parent
- Duplicate PDF generation (wasted compute)
- Potential confusion in audit trail

**FIX:** Use Upstash Redis distributed lock around the receipt/notification side-effects:
```ts
import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Inside verifyPhonePePayment, after $transaction commits, before receipt generation:
const lockKey = `fee:receipt_lock:${payment.id}`;
const acquired = await redis.set(lockKey, '1', { nx: true, ex: 30 });
if (!acquired) {
  return { success: true, status: 'COMPLETED', message: 'Receipt already being generated' };
}

try {
  // ... generate receipt, send notification ...
} finally {
  await redis.del(lockKey);
}
```

---

### BUG #3 — Offline Payment Duplicate transactionId
**FILE:** `lib/data/fee/recordOfflinePayment.ts`
**SEVERITY:** high

**DESCRIPTION:**
`recordOfflinePayment` wraps FeePayment creation + Fee update in `$transaction`, which is correct. But there is no unique constraint preventing two admins from simultaneously recording an offline payment for the same fee with the same `transactionId`. The `receiptNumber` is `@unique`, but `transactionId` is not constrained.

**FIX:**
```prisma
// prisma/schema.prisma
model FeePayment {
  // ...existing fields
  @@unique([feeId, transactionId])
}
```

```ts
// lib/data/fee/recordOfflinePayment.ts — inside $transaction
const existing = await tx.feePayment.findFirst({
  where: { feeId: fee.id, transactionId: validatedData.transactionId },
});
if (existing) throw new Error('Payment with this transaction ID already exists');
```

---

## 2. PRISMA TRANSACTION SAFETY

### BUG #4 — FeePayment Created AFTER PhonePe API Call (Orphaned Payments on DB Failure)
**FILE:** `lib/data/fee/recordOnlinePayment.ts` — `phonePayInitPayment()`
**SEVERITY:** high

**DESCRIPTION:**
The FeePayment record is created after the PhonePe API call succeeds. If the DB write fails (network issue, constraint violation, connection pool exhaustion), the user is redirected to PhonePe and pays, but there is no FeePayment record to match the callback. The callback's `verifyPhonePePayment` will find `payment === null` and return `NOT_FOUND`, leaving the payment completely orphaned — money collected, no record.

**FIX:** Create the FeePayment record BEFORE calling PhonePe:
```ts
// 1. Create PENDING record FIRST (order matters!)
await prisma.feePayment.create({
  data: {
    feeId: fee.id,
    amount: pendingAmount,
    status: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.UPI,
    receiptNumber,
    transactionId,
    note: 'Payment initiated via parent dashboard',
    payerId: userId,
    organizationId,
    platformFee,
    recordedBy: userId,
  },
});

// 2. THEN call PhonePe API
const response = await fetch(PAY_API_URL, { /* ... */ });
```

---

### BUG #5 — PENDING Payment Cleanup Is Global Sweep, Not TTL-Based
**FILE:** `app/api/inngest/functions.ts` — `updatePaymentStatus`
**SEVERITY:** high

**DESCRIPTION:**
The cron job `30 22 * * *` (4:00 AM IST) sets every `PENDING` payment to `FAILED` regardless of age. A user who initiates payment at 3:58 AM and is still on the PhonePe checkout page at 4:00 AM would have their payment marked FAILED while they're still paying.

**FIX:** Add a TTL column and time threshold:
```prisma
// prisma/schema.prisma
model FeePayment {
  // ...
  expiresAt DateTime? // when PENDING payments auto-expire
}
```

```ts
// app/api/inngest/functions.ts
export const updatePaymentStatus = inngest.createFunction(
  { id: 'payment-status-update' },
  { cron: '30 22 * * *' },
  async ({ step }) => {
    const affectedRows = await step.run('fetch-payment-status', async () =>
      prisma.feePayment.updateMany({
        where: {
          status: 'PENDING',
          expiresAt: { lt: new Date() }, // only expired ones
        },
        data: { status: 'FAILED' },
      })
    );
    return { message: `${affectedRows.count} expired PENDING payments marked as FAILED.` };
  }
);
```

```ts
// In phonePayInitPayment, set expiry to 30 minutes:
await prisma.feePayment.create({
  data: {
    // ...existing...
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  },
});
```

---

## 3. AUTHORIZATION

### BUG #6 — `phonePayInitPayment` Missing Organization Scope on Fee Lookup
**FILE:** `lib/data/fee/recordOnlinePayment.ts` — `phonePayInitPayment()`
**SEVERITY:** critical

**DESCRIPTION:**
The function fetches `userId` and `organizationId`, then queries `prisma.fee.findUnique({ where: { id: feeId } })` without scoping to `organizationId`. An authenticated user from organization A could initiate payment for any fee in the entire system by guessing fee IDs.

**FIX:**
```ts
const fee = await prisma.fee.findFirst({
  where: { id: feeId, organizationId }, // ADD organizationId
  select: { /* ... */ }
});

if (!fee) throw new Error('Fee not found or access denied');
```

---

### BUG #7 — `getOnlinePaymentStatus` Missing Organization Scope
**FILE:** `lib/data/fee/recordOnlinePayment.ts` — `getOnlinePaymentStatus()`
**SEVERITY:** high

**DESCRIPTION:**
Queries `FeePayment` only by `transactionId` and `payerId`. If a user is a payer in multiple organizations, they could see payments across orgs. No `organizationId` filter is applied.

**FIX:**
```ts
const payment = await prisma.feePayment.findFirst({
  where: {
    transactionId,
    payerId: userId,
    organizationId, // ADD
  },
  include: { /* ... */ }
});
```

---

### BUG #8 — `verifyPhonePePayment` Missing Organization Validation
**FILE:** `lib/data/fee/recordOnlinePayment.ts` — `verifyPhonePePayment()`
**SEVERITY:** high

**DESCRIPTION:**
The callback endpoint loads the payment by `transactionId` alone. No organization validation. While this is primarily a server-to-server callback, a malicious actor who knows a `transactionId` could trigger the GET endpoint and cause side-effects.

**FIX:**
```ts
const organizationId = await getOrganizationId();
const payment = await prisma.feePayment.findFirst({
  where: {
    transactionId,
    organizationId, // validate org membership
  },
  select: { /* ... */ }
});
```

---

### BUG #9 — `getFeeRecords` Leaks All Students' Fees Without Role Check
**FILE:** `lib/data/fee/get-all-students-fees.ts`
**SEVERITY:** medium

**DESCRIPTION:**
`getFeeRecords` fetches ALL fees for the organization without any student or role scoping. This function is used by admin-facing pages, but if it's ever called from a non-admin context (e.g., student or parent), it leaks all students' fee data. The function has no role check and no `studentId` parameter.

**FIX:**
```ts
export async function getFeeRecords(
  count: number = 50,
  studentId?: string,
  role?: string
) {
  const organizationId = await getOrganizationId();

  // Role-based scoping
  const whereClause: any = { organizationId };

  if (studentId) {
    whereClause.studentId = studentId; // Parent/student see only their data
  }
  // Admin role sees all (no additional filter)

  const fees = await prisma.fee.findMany({
    where: whereClause,
    // ...
  });
}
```

---

### BUG #10 — Parent Ownership Guard Doesn't Verify Same Organization
**FILE:** `lib/data/fee/get-parent-fees-data.ts`
**SEVERITY:** low

**DESCRIPTION:**
The ownership guard `parents: { some: { parent: { userId } } }` only checks that the user is a parent — it doesn't verify the parent belongs to the same organization as the fee. In a multi-tenant scenario where a parent has children in different organizations, this could leak cross-org data.

**FIX:** Already has `student: { organizationId }` at top level, which is sufficient. The nested `student.organizationId` in the sub-query is redundant but harmless. No change required, but cleanup recommended:
```ts
// Remove the redundant inner organizationId — the outer where already scopes it
where: {
  studentId: selectedChildId,
  organizationId,
  academicYearId,
  student: {
    parents: { some: { parent: { userId } } },
  },
}
```

---

## 4. RECEIPT GENERATION

### BUG #11 — PDF Generation Failure Crashes Payment Flow
**FILE:** `lib/data/fee/recordOnlinePayment.ts` — `verifyPhonePePayment()` (after $transaction)
**SEVERITY:** high

**DESCRIPTION:**
After marking the payment COMPLETED in a transaction, the code calls `preparePaymentReceipt()` which generates a PDF. If `generateReceiptBuffer` throws (e.g., `@react-pdf/renderer` fails, network issue loading org logo, font rendering error, invalid data), the exception propagates and the function returns an error — even though the payment was already committed to the database. The user sees a failed payment, but the DB shows COMPLETED. This is a classic "side-effect after commit" problem.

**FIX:** Wrap receipt generation in try/catch:
```ts
// After $transaction commits:
let pdfBuffer: Buffer | null = null;
let feeRecordForNotify: any = null;

try {
  const result = await preparePaymentReceipt(
    payment.feeId,
    payment.organizationId,
    { /* ... */ }
  );
  pdfBuffer = result.pdfBuffer;
  feeRecordForNotify = result.feeRecord;
} catch (err) {
  console.error('[VERIFY_PAYMENT] Receipt generation failed (non-fatal):', err);
  // Payment is still COMPLETED — just log and continue without attachment
}

notify.fee.paymentSuccess({
  feeId: payment.feeId,
  recipients: [{ studentId: payment.fee.studentId }],
  ...(pdfBuffer ? {
    attachment: {
      filename: `Receipt-${payment.receiptNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  } : {}),
  variables: {
    studentName: feeRecordForNotify?.student.firstName
      ? `${feeRecordForNotify.student.firstName} ${feeRecordForNotify.student.lastName}`
      : `${payment.fee.student.firstName} ${payment.fee.student.lastName}`,
    receiptNumber: payment.receiptNumber!,
    receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fees/?txn=${transactionId}`,
    feeName: feeRecordForNotify?.feeCategory.name ?? payment.fee.feeCategory.name,
    amount: totalPayableAmount,
    paidAt: paymentDate,
  },
});
```

---

### BUG #12 — Receipts Not Idempotent — No Regeneration Endpoint
**FILE:** `lib/data/fee/preparePaymentReceipt.ts`
**SEVERITY:** medium

**DESCRIPTION:**
`preparePaymentReceipt` receives a `receiptNumber` from the caller. The caller generates a new `receiptNumber` at call time via `REC-${randomUUID()}`. If `preparePaymentReceipt` is called twice for the same `FeePayment`, the second call would produce a different `receiptNumber`. There is no server action to re-generate a receipt using the original payment's `receiptNumber` from the DB.

**FIX:** Add an idempotent regeneration endpoint:
```ts
// lib/data/fee/regenerateReceipt.ts
'use server';

import prisma from '@/lib/db';
import { preparePaymentReceipt } from './preparePaymentReceipt';

export async function regenerateReceipt(feePaymentId: string, organizationId: string) {
  const payment = await prisma.feePayment.findUnique({
    where: { id: feePaymentId, organizationId },
  });
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'COMPLETED') throw new Error('Payment not completed');

  return preparePaymentReceipt(payment.feeId, organizationId, {
    amount: payment.amount,
    paymentDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    receiptNumber: payment.receiptNumber, // use DB value — idempotent
    status: payment.status,
    payerId: payment.payerId,
  });
}
```

---

### BUG #13 — Empty PDF Buffer Not Validated
**FILE:** `lib/pdf-generator/generateReceiptBuffer.tsx`
**SEVERITY:** medium

**DESCRIPTION:**
`renderToBuffer` from `@react-pdf/renderer` can resolve with a Buffer that is 0 bytes or corrupted if the React tree has rendering issues. No validation of the buffer before returning.

**FIX:**
```ts
export async function generateReceiptBuffer(record: FeeRecord): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <FeeReceiptPDF feeRecord={record} copyType="ORIGINAL" />
  );
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF generation produced empty buffer');
  }
  if (buffer.length > 10 * 1024 * 1024) { // 10MB safety limit
    throw new Error('PDF generation produced oversized buffer (>10MB)');
  }
  return buffer;
}
```

---

## 5. STATE MACHINE

### BUG #14 — No State Transition Validation (REFUNDED → COMPLETED Possible)
**FILE:** `lib/data/fee/recordOnlinePayment.ts` — `verifyPhonePePayment()`
**SEVERITY:** high

**DESCRIPTION:**
The `PaymentStatus` enum has: `PENDING, UNPAID, COMPLETED, FAILED, REFUNDED, CANCELLED`. There is no validation preventing invalid state transitions:
- `COMPLETED → COMPLETED` — partially guarded by idempotency check
- `REFUNDED → COMPLETED` — NO guard; if a refund is issued and then a stale callback arrives, the payment could be re-completed
- `FAILED → COMPLETED` — allowed without re-verification of the payment gateway

The idempotency guard checks `if (payment.status === COMPLETED)` and returns early. But there is no guard against `REFUNDED → COMPLETED`.

**FIX:** Add explicit state transition validation:
```ts
const VALID_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING:    ['COMPLETED', 'FAILED', 'CANCELLED'],
  UNPAID:     ['COMPLETED', 'FAILED'],
  COMPLETED:  ['REFUNDED'],
  FAILED:     ['PENDING'],     // allow retry
  REFUNDED:   [],               // terminal state
  CANCELLED:  [],               // terminal state
};

// Inside verifyPhonePePayment, before any update:
const allowedTargets = VALID_TRANSITIONS[payment.status as PaymentStatus] || [];
if (!allowedTargets.includes(PaymentStatus.COMPLETED)) {
  console.error(
    `[VERIFY_PAYMENT] Invalid state transition: ${payment.status} → COMPLETED`
  );
  return {
    success: false,
    status: 'INVALID_TRANSITION',
    message: 'Payment is in a terminal state and cannot be modified',
  };
}
```

---

### BUG #15 — No PARTIAL Fee Status for Split Payments
**FILE:** `prisma/schema.prisma` — `FeeStatus` enum
**SEVERITY:** medium

**DESCRIPTION:**
`FeeStatus` only has `PAID, UNPAID, OVERDUE`. If a fee of ₹10,000 has ₹5,000 paid, the status stays `UNPAID` (or `OVERDUE` if past due date). There is no `PARTIAL` state, meaning the UI cannot distinguish between "never paid anything" and "half paid". Parents and admins see the same status for both cases.

The code derives `newStatus` in `verifyPhonePePayment` as:
```ts
const newStatus = pendingAmount === 0 ? FeeStatus.PAID : /* OVERDUE or UNPAID */;
```
This means a partially-paid fee is shown identically to a fully-unpaid fee.

**FIX:**
```prisma
// prisma/schema.prisma
enum FeeStatus {
  PAID
  UNPAID
  PARTIAL    // NEW — some amount paid, balance remaining
  OVERDUE
}
```

```ts
// In verifyPhonePePayment and recordOfflinePayment:
const newStatus: FeeStatus =
  pendingAmount === 0
    ? FeeStatus.PAID
    : paidAmount > 0
      ? FeeStatus.PARTIAL
      : new Date(fee.dueDate) < new Date()
        ? FeeStatus.OVERDUE
        : FeeStatus.UNPAID;

await tx.fee.update({
  where: { id: payment.feeId },
  data: { paidAmount, pendingAmount, status: newStatus },
});
```

---

### BUG #16 — No Refund Server Action Exists
**FILE:** (missing)
**SEVERITY:** medium

**DESCRIPTION:**
`PaymentStatus.REFUNDED` exists in the enum, but there is no server action to perform a refund. This means:
- A payment can never legally reach the REFUNDED state
- If someone manually sets it to REFUNDED via DB console, the Fee record's `paidAmount`/`pendingAmount` are NOT recalculated
- The state machine allows `COMPLETED → REFUNDED` in theory, but there's no code to handle the fee reversal
- No audit trail for refunds (who refunded, when, why)

**FIX:** Create a refund server action:
```ts
// lib/data/fee/refundPayment.ts
'use server';

import prisma from '@/lib/db';
import { FeeStatus, PaymentStatus } from '@/generated/prisma/enums';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentUserId } from '@/lib/user';
import { revalidatePath } from 'next/cache';

export async function refundPayment(feePaymentId: string, reason: string) {
  const userId = await getCurrentUserId();
  const organizationId = await getOrganizationId();

  await prisma.$transaction(async (tx) => {
    const payment = await tx.feePayment.findUnique({
      where: { id: feePaymentId, organizationId },
      include: { fee: true },
    });
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Only completed payments can be refunded');
    }

    // Mark payment as refunded
    await tx.feePayment.update({
      where: { id: feePaymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        note: `Refunded by ${userId}: ${reason}`,
      },
    });

    // Recalculate fee from remaining COMPLETED payments
    const completedPayments = await tx.feePayment.findMany({
      where: { feeId: payment.feeId, status: PaymentStatus.COMPLETED },
      select: { amount: true },
    });

    const paidAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = Math.max(payment.fee.totalFee - paidAmount, 0);

    const newStatus: FeeStatus =
      pendingAmount === 0
        ? FeeStatus.PAID
        : paidAmount > 0
          ? FeeStatus.PARTIAL
          : new Date(payment.fee.dueDate) < new Date()
            ? FeeStatus.OVERDUE
            : FeeStatus.UNPAID;

    await tx.fee.update({
      where: { id: payment.feeId },
      data: { paidAmount, pendingAmount, status: newStatus },
    });
  });

  revalidatePath('/dashboard/fees');
  return { success: true, message: `Refund processed: ${reason}` };
}
```

---

## Appendix: Quick Reference — Files Requiring Changes

| Priority | File | Bugs |
|----------|------|------|
| P0 | `lib/data/fee/recordOnlinePayment.ts` | #1, #2, #4, #6, #7, #8, #11, #14 |
| P0 | `prisma/schema.prisma` | #1, #5, #15 |
| P1 | `lib/data/fee/recordOfflinePayment.ts` | #3 |
| P1 | `app/api/inngest/functions.ts` | #5, #16 |
| P1 | `lib/data/fee/get-all-students-fees.ts` | #9 |
| P2 | `lib/pdf-generator/generateReceiptBuffer.tsx` | #13 |
| P2 | `lib/data/fee/preparePaymentReceipt.ts` | #12 |
| P2 | `lib/data/fee/get-parent-fees-data.ts` | #10 |
| P2 | (new) `lib/data/fee/refundPayment.ts` | #16 |
