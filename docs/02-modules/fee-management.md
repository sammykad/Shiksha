# 💰 Fee Management — 0 to 100 Tonight

> Solo dev · Tonight's sprint · Goal: Fee module fully shippable to a real school

---

## ✅ Already Done (Don't Touch)

- [x] Admin / Teacher can assign fees to multiple students
- [x] Student / Parent get notified with payment link + message template
- [x] Student / Parent portal: Paid / Pending / Total / Receipts (View + Download)
- [x] Parent / Student can pay via multiple methods (online + offline)
- [x] Admin / Teacher dashboard recent activity updated
- [x] Teacher can see their assigned section's fees
- [x] Fee Stats: Fee Collection by Category + Monthly Fee Collection (interactive)
- [x] Fee Detail page: Student Info, Fee Info, Payment Info, Payment History, Payment Summary
- [x] Download fee receipt — select type + number of copies
- [x] Teacher can send reminders with pre-built templates + preview + channel override
- [x] Schedule reminder (meta feature)
- [x] Pagination, Search, Filter, Sort, Tabs (All / Paid / Unpaid / Overdue)

---

## 🚨 Must Fix Tonight — Blockers (Do These First)

### 1. Receipt Generation : Done

**What done looks like:** After any payment (online or offline), a PDF receipt is generated correctly with student name, amount, fee category, date, transaction ID, and school stamp area.

- [ ] Debug receipt generation — identify where it breaks (server action? PDF template? data missing?)
- [ ] Ensure receipt downloads correctly from student + parent portal
- [ ] Ensure receipt is auto-delivered via WhatsApp/email on payment success
- [ ] Test: offline payment marked by admin → receipt generated → student can download

---

```prisma
// Add to your Payment or FeePayment model
platfromFee          Float?    // Platform/gateway fee charged (2.5%)
refundedAt     DateTime? // For future refund flow
refundReason   String?   // For future refund flow
refundAmount   Float?    // For future refund flow
```

- [ ] Add above fields to Prisma schema
- [ ] Run migration (`npx prisma migrate dev`)
- [ ] Update payment creation server action to store `pgFee` and `netSettlement` on every transaction
- [ ] Show `netSettlement` in admin fee detail view (so school knows what they'll receive)

---

### 3. Decide + Implement PG Charge Split (2.5%)

**You must decide this tonight.** Here are your 3 options:

| Option                     | How it works                                 | Recommendation               |
| -------------------------- | -------------------------------------------- | ---------------------------- |
| **A — School absorbs**     | School gets `amount - 2.5%`. Simple.         | ✅ Easiest to launch         |
| **B — Student pays extra** | Student shown `amount + 2.5%` before Pay Now | Causes confusion, complaints |
| **C — Split**              | You decide percentage later                  | Don't do this at launch      |

**Recommendation: Go with Option A.** Tell schools upfront: "Online payments have 2.5% gateway fee deducted." Clear, honest, simple.

- [ ] Decide (commit to Option A or B)
- [ ] Update the payment flow to calculate `pgFee = amount * 0.025` and `netSettlement = amount - pgFee`
- [ ] Store both in DB (from step 2 above)
- [ ] Show fee breakdown on the "Pay Now" confirmation screen:
  ```
  Fee Amount:     ₹1,000
  Gateway Fee:      ₹25  (2.5%)
  Total Payable:  ₹1,025   ← if student pays
  —— OR ——
  You Pay:        ₹1,000
  School Receives:  ₹975   ← if school absorbs
  ```

---

### 4. Fee Breakdown UI Before "Pay Now" : Done

**Current state:** Student clicks Pay Now and sees ₹102 with no explanation. They panic.

- [ ] Add a confirmation modal/screen before payment with:
  - Fee name and description
  - Base amount
  - PG fee (if student pays) OR a note "inclusive of gateway charges"
  - Total amount
  - "Confirm & Pay" CTA
- [ ] Keep it simple — one screen, not a multi-step wizard

---

### 5. Payment Notification Triggers — Sometimes Skip Due to IDEMPOTENCY

**Current state:** Notification trigger for "fee paid" not firing.

- [ ] Need To fix EventId In notification Engine

---

### 6. Offline vs Online Payment Logic (Scam Prevention)

**The problem:** A school can mark ₹1,000 as "offline" even if student paid online, pocketing the difference from gateway fee.

**Fix for tonight (simple):**

- [ ] Offline payments: set `pgFee = 0`, `netSettlement = fullAmount`, `paymentMethod = OFFLINE`
- [ ] Online payments: set `pgFee = amount * 0.025`, auto-calculated, cannot be overridden by admin
- [ ] In admin view, clearly badge each payment: `ONLINE` or `OFFLINE`
- [ ] In reports, show separate totals: "Online Collected: ₹X | Offline Collected: ₹Y"

This gives you an audit trail and makes scamming visible in reports.

---

### 7. Payment Link — Add to Fee Assignment SMS ,Real Payment Link not ready (Skip)

**Current state:** Notification sent but no payment link included.

- [ ] Generate a payment link for each fee assignment (can be a route like `/pay?feeId=xxx&studentId=yyy`)
- [ ] Add payment link to the fee assignment WhatsApp/SMS template
- [ ] Student/parent can pay without opening the app — just click link
- [ ] Secure the link: verify `feeId` belongs to `studentId` on load

---

## 🟡 Important But Can Finish Post-Midnight

### 8. Fee Reconciliation (Admin)

A single page that shows:

- [ ] Total assigned: ₹X
- [ ] Total collected (online): ₹X
- [ ] Total collected (offline): ₹X
- [ ] Platform fees deducted: ₹X
- [ ] Net settlement to school: ₹X
- [ ] Outstanding: ₹X
- [ ] Overdue (past due date): ₹X

Export as CSV. This is what a school principal asks for on the 1st of every month.

---

### 9. T+2 / T+7 Settlement — Decide, Don't Build Yet

**Don't build this tonight.** But decide:

- PhonePe settles to YOUR account at T+2
- You then manually transfer to the school's account
- For launch: manual transfer is fine. No automation needed.
- Add a "Settlement Status" field to your records so you can track what you've paid out

**Schema addition (do with migration above):**

```prisma
settlementStatus   String?   // PENDING | SETTLED
settledAt          DateTime?
settlementRef      String?   // Your bank transfer reference
```

---

### 10. Refund Schema — Add Tonight, Logic Later (Skip)

**Don't build refund UI tonight.** But add fields now:

Already included in step 2 above (`refundedAt`, `refundReason`, `refundAmount`). Just make sure they're in the migration. When a parent asks for a refund, you handle it manually and fill these fields directly in DB until you build the UI post-launch.

---

## 🟢 Defer — Don't Touch Tonight

- [ ] ~~Fee category cloning ("Copy from 2024–25")~~ → Post-launch
- [ ] ~~FeeSense AI agent~~ → Already built, don't regress
- [ ] ~~Partial payment for online fees~~ → Only offline supports chunk payments, keep it that way
- [ ] ~~Fee breakup (Exam fee separate, Sport fee separate)~~ → Description field covers this for now
- [ ] ~~Production PhonePe switch~~ → Tonight is still dev/test env. Switch to prod only after all above is verified
- [ ] ~~SaaS billing (collect ₹79/student)~~ → Separate sprint

---

## 📋 Tonight's Execution Order

Work in this exact order. Do not skip ahead.

```
1. Add pgFee + netSettlement + refund fields to schema → migrate (15 min)
2. Fix receipt generation — get ONE receipt working correctly (45 min) : DONE
3. Implement PG charge split logic (Option A) in payment server action (20 min)
4. Add fee breakdown UI before Pay Now confirmation (30 min)
5. Fix "fee paid" notification trigger (30 min)
6. Add payment link to SMS/WhatsApp template (20 min)
7. Implement offline vs online badge + separate report totals (20 min)
8. Test full flow: assign → notify → pay online → receipt → WhatsApp fires (30 min)
9. Test full flow: assign → pay offline → receipt → no PG fee deducted (20 min)
10. Fee reconciliation report page (45 min if energy left) ⚠️
```

**Estimated time: 4–5 hours focused work.**

---

## ✅ "Done" Definition for Fee Management

Fee Management is 100% done when:

1. Admin assigns fee → student/parent gets WhatsApp with payment link ✅
2. Student pays online → receipt auto-generated → delivered via WhatsApp /Email + downloadable ✅
3. Admin marks offline payment → receipt generated → no PG fee deducted ✅
4. Fee breakdown shown before Pay Now (no ₹102 confusion) Added in parent ✅
5. Notification fires on success AND failure ,ALL Fees Related Fired✅
6. Admin sees reconciliation: Online total / Offline total / Outstanding / Net settlement ⚠️
7. Refund fields in schema (even if no UI yet) (Skip For now)⚠️
8. Who pays PG fee? | School absorbs OR Student pays extra **Parents** ✅

**If all 8 are true → Fee Management ships to a real school tomorrow.**

---

## ⚠️ Decisions You Must Make Before Coding

Answer these before writing a single line tonight:

| Decision                             | Options                              | Pick One                                   |
| ------------------------------------ | ------------------------------------ | ------------------------------------------ |
| Who pays PG fee?                     | School absorbs OR Student pays extra | → **School absorbs (recommended)**         |
| Settlement timeline to tell schools? | T+2 or T+7                           | → Tell them T+7 to be safe, deliver at T+2 |
| Partial online payments?⚠️           | Allow or block                       | → **Block for now (offline only)**         |
| Refund handling? ⚠️                  | Manual (DB only) or UI               | → **Manual for launch**                    |
| Payment link expiry?⚠️               | 24h, 48h, 7 days, never              | → **7 days**                               |
