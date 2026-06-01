# Fee Management Version Roadmap PRD

**Status:** Draft  
**Date:** 2026-05-30  
**Owner:** Solo dev  
**Product:** Shiksha Fee Management  
**Related PRD:** `docs/02-modules/fee-management-refactor-prd.md`

---

## 1. Problem and Context

Fee management is one of the most trust-sensitive modules in Shiksha. Schools do not only need to collect money; they need to explain why a student owes a specific amount, who changed it, when it was paid, what is still pending, and whether the receipt is valid.

The immediate launch version should stay focused on correctness. After that, Shiksha can add richer school finance workflows in controlled layers.

This PRD defines the product roadmap across three versions:

- **V1:** Current launch-ready fee system with one source of truth.
- **V2:** Operational flexibility: discounts, scholarships, fines, penalties, installments, and refund UI.
- **V3:** Production-grade finance system: GST, formal fee structures, advanced installments, auditability, reconciliation, and compliance-ready workflows.

The key product rule: every version must preserve the single source of truth established in V1.

---

## 2. Why Now

V1 is needed now because the product must launch with correct balances and predictable payment behavior.

V2 is needed after launch because real schools will quickly ask for practical exceptions: sibling discounts, merit scholarships, late fines, partial payment schedules, and refund handling.

V3 is needed when Shiksha moves from "fee collection software" to "production-grade financial operations for schools." That requires GST-ready documents, structured fee plans, formal ledgers, reconciliation, audit logs, and better controls.

---

## 3. Success Criteria

The roadmap is successful when:

- V1 can launch without GST, discounts, scholarships, fines, penalties, installments, or refund UI.
- V2 adds school-level operational flexibility without breaking V1 balance correctness.
- V3 supports production-grade finance requirements while remaining understandable to school admins.
- Each version can ship independently.
- No version requires rewriting all fee pages from scratch.

---

## 4. Version Summary

| Version | Theme | Primary Outcome |
| --- | --- | --- |
| V1 | Current launch foundation | One fee balance, one payment truth, stable fee pages |
| V2 | School operations | Controlled adjustments, installments, fines, penalties, refund UI |
| V3 | Production finance | GST, fee structures, advanced installments, ledgers, reconciliation, compliance |

---

## 5. V1 - Current Launch Foundation

### Goal

Ship the existing fee management system with a reliable single source of truth for balances and payments.

### In Scope

- Existing `FeeCategory`, `Fee`, `FeePayment`, and `ChequeDetail` models.
- Assign fees to students.
- Student and parent pay pages.
- Admin and teacher fee views.
- Online, offline, and PDC payment recording.
- Receipt generation and download.
- Fee reminders using current notification system.
- Canonical balance calculation through `lib/data/fee/fee-balance.ts`.
- Synced mirror fields: `Fee.paidAmount`, `Fee.pendingAmount`, `Fee.status`.
- Organization and academic-year scoped fee reads.

### Out of Scope

- GST
- Discounts
- Scholarships
- Fine or penalty engine
- Formal installment engine
- Refund UI
- Fee structure redesign
- Ledger model
- Settlement automation

### Functional Requirements

#### V1-FR1 - Canonical Balance

All fee pages and server actions must calculate paid and pending amounts through the shared fee balance helper.

#### V1-FR2 - Payment Writes

After any payment status change, the system must sync the fee mirror fields through the canonical balance path.

#### V1-FR3 - Role Consistency

Admin, student, parent, teacher, and report views must show the same fee amount for the same student fee.

#### V1-FR4 - PDC Handling

PDC payments must not reduce pending amount until the cheque is cleared.

### V1 Done Definition

V1 is done when:

- The same fee shows the same paid and pending amount everywhere.
- Completed payments are the only source of paid amount.
- Student/parent pay pages use current pending amount.
- Admin can record offline and PDC payments safely.
- Receipts match payment records.
- No V2/V3 financial concepts are added.

---

## 6. V2 - Discounts, Scholarships, Fines, Penalties, Installments, Refund UI

### Goal

Add practical school finance workflows while keeping the V1 balance engine intact.

V2 should let a school answer:

- Why did this student owe less than the assigned amount?
- Why did this student owe more because of delay or penalty?
- Which installment is due now?
- Was any amount refunded?
- Who approved the change?

### In Scope

- Discounts
- Scholarships
- Waivers/concessions
- Fines
- Late payment penalties
- Simple installment plans
- Refund request and refund processing UI
- Adjustment approval workflow
- Adjustment audit history
- Parent/student visibility into fee breakdown

### Product Principles

- Adjustments must be explicit records, not hidden edits to `totalFee`.
- The original assigned fee should remain visible.
- Every discount, scholarship, fine, penalty, and refund must have a reason and actor.
- Parent-facing language should be simple: "Original fee", "Discount", "Fine", "Paid", "Pending".
- Admin-facing views should show full audit details.

### Proposed Models

Final schema should be designed during implementation, but V2 likely needs these concepts:

```txt
FeeAdjustment
FeeInstallment
RefundRequest
RefundTransaction
```

### Functional Requirements

#### V2-FR1 - Discounts

Admins can apply a fixed amount or percentage discount to a student fee.

Acceptance criteria:

- Discount requires reason.
- Discount records who applied it.
- Discount reduces payable amount.
- Discount cannot make payable amount negative.
- Discount is visible in fee details and receipt breakdown.

#### V2-FR2 - Scholarships

Admins can apply scholarship support to a student fee.

Acceptance criteria:

- Scholarship has source/type, amount, reason, and approver.
- Scholarship is separate from generic discount in reporting.
- Scholarship reduces payable amount.
- Scholarship appears in admin and parent fee breakdown.

#### V2-FR3 - Waivers and Concessions

Admins can waive part or all of a fee for approved reasons.

Acceptance criteria:

- Full waiver marks payable amount as zero only after approval.
- Partial waiver reduces payable amount.
- Waiver is audit logged.

#### V2-FR4 - Fines and Penalties

Admins can configure fines or late penalties for overdue fees.

Acceptance criteria:

- Penalty can be fixed amount or percentage.
- Penalty can be one-time or recurring by configured period.
- Penalty is visible separately from base fee.
- Penalty can be waived by authorized admin.

#### V2-FR5 - Simple Installments

Admins can split a fee into scheduled installments.

Acceptance criteria:

- Each installment has amount, due date, status, and payment mapping.
- Student pay page shows the current due installment and total outstanding.
- Paying one installment does not hide future unpaid installments.
- Admin can see installment progress.

#### V2-FR6 - Refund UI

Admins can initiate and track refunds from the dashboard.

Acceptance criteria:

- Refund has requested amount, reason, status, requester, approver, and payment reference.
- Refund status states include requested, approved, rejected, processing, completed, and failed.
- Refund cannot exceed refundable paid amount.
- Refunded amount is visible in payment history.
- Receipt/payment record clearly shows refund status.

#### V2-FR7 - Adjustment Audit Trail

Every adjustment must preserve who did what, when, and why.

Acceptance criteria:

- Fee changes do not overwrite original assigned amount.
- All adjustments are immutable once applied; corrections create reversal records.
- Admin can view adjustment history per fee.

### V2 Done Definition

V2 is done when:

- Schools can handle real-world exceptions without editing raw fee totals.
- Parent/student pages explain adjusted payable amount clearly.
- Admins can audit discounts, scholarships, fines, penalties, installments, and refunds.
- V1 balance correctness still works.
- Reports separate base fee, adjustments, penalties, collected, refunded, and pending.

---

## 7. V3 - GST, Fee Structure, Advanced Installments, Production Ready

### Goal

Turn fee management into a production-grade school finance system ready for larger institutions, compliance-heavy schools, and operational scale.

V3 should support:

- GST-ready fee documents where applicable.
- Formal fee structures by grade, section, batch, transport, hostel, or custom grouping.
- Advanced installment schedules.
- Financial ledgers.
- Reconciliation.
- Audit logs.
- Role-based approvals.
- Production-grade reporting.

### In Scope

- GST configuration
- GST invoice/receipt support
- HSN/SAC and tax component handling where applicable
- Formal `FeeStructure`
- Fee structure versioning
- Grade/section/student group fee plans
- Advanced installment templates
- Ledger entries
- Payment gateway reconciliation
- Settlement tracking
- Refund accounting
- Approval workflows
- Audit log exports
- Production reports
- Data migration tools

### Functional Requirements

#### V3-FR1 - GST Configuration

Organizations can configure whether GST applies to specific fee categories or services.

Acceptance criteria:

- GST can be disabled for schools that do not need it.
- GST rate is configurable per fee component/category where applicable.
- Taxable and non-taxable fee lines can coexist.
- Receipts/invoices show tax breakdown only when GST is enabled.

#### V3-FR2 - GST-Ready Documents

The system can generate GST-ready invoices or receipts when required.

Acceptance criteria:

- Document includes organization GSTIN when configured.
- Document includes tax rate, taxable value, tax amount, and total.
- Document numbering follows configured sequence rules.
- Cancelled/refunded documents are traceable.

#### V3-FR3 - Fee Structure

Admins can define reusable fee structures instead of assigning every fee manually.

Acceptance criteria:

- Fee structure can apply by academic year, grade, section, student group, or category.
- Fee structure has version history.
- Existing assigned fees are not silently changed when a structure changes.
- Admin can preview affected students before applying a structure.

#### V3-FR4 - Advanced Installments

Admins can create installment templates as part of a fee structure.

Acceptance criteria:

- Installments can be monthly, quarterly, term-wise, custom dates, or percentage-based.
- Each installment can have its own due date and penalty rule.
- Student/parent pay page can show next due, all upcoming, and total outstanding.
- Receipts map payments to installment lines.

#### V3-FR5 - Ledger

Every financial event creates ledger entries.

Acceptance criteria:

- Assignment, payment, adjustment, penalty, refund, cancellation, and settlement events create ledger entries.
- Ledger entries are append-only.
- Reports derive from ledger where financial accuracy is required.

#### V3-FR6 - Reconciliation

Admins can reconcile payment gateway settlements and offline collections.

Acceptance criteria:

- Gateway payments can be matched against settlement files or gateway references.
- Offline collections can be marked deposited.
- Reports show collected, refunded, gateway charges, settlement pending, and settled amount.

#### V3-FR7 - Production Controls

The system supports controls needed before large-scale rollout.

Acceptance criteria:

- Role-based approvals for large discounts, waivers, refunds, and reversals.
- Audit logs for all financial mutations.
- Exportable reports for admin/accounting review.
- Data repair scripts for detected balance drift.
- Monitoring for failed payment callbacks and receipt generation failures.

### V3 Done Definition

V3 is done when:

- A school can define fee structures once and apply them safely.
- Installments are first-class and tied to structure, payment, receipt, and reports.
- GST-ready documents can be generated where needed.
- Finance reports reconcile with payment records, refunds, adjustments, and settlements.
- The system is production-ready for larger schools and multi-branch operations.

---

## 8. Cross-Version Rules

These rules apply to every version:

- Never hide the original assigned amount.
- Never mutate historical payment records to correct a mistake.
- Use reversal or adjustment records for corrections.
- Every financial change must have actor, timestamp, reason, and organization scope.
- Student and parent views should prioritize clarity over accounting terminology.
- Admin/accounting views should expose the full breakdown.
- New features must preserve V1 balance correctness.

---

## 9. Reporting Roadmap

### V1 Reports

- Total assigned
- Total collected
- Total pending
- Total overdue
- Paid/unpaid students

### V2 Reports

- Discounts given
- Scholarships granted
- Waivers approved
- Fines and penalties applied
- Refunds requested/completed
- Installment due list

### V3 Reports

- GST taxable/non-taxable summary
- Invoice/receipt register
- Ledger export
- Gateway reconciliation
- Settlement report
- Refund accounting
- Fee structure collection report
- Audit trail export

---

## 10. Risks

| Risk | Version | Mitigation |
| --- | --- | --- |
| V2 adjustments break V1 balance | V2 | Add adjustment records and derive payable amount through one service |
| Penalty rules become too complex | V2 | Start with fixed and percentage rules only |
| Refunds reduce collected totals incorrectly | V2 | Track refunds separately from original payment records |
| GST creates compliance risk | V3 | Make GST configurable and validate with an accountant before launch |
| Fee structure changes alter historical fees | V3 | Version structures and never silently mutate existing assigned fees |
| Ledger increases implementation complexity | V3 | Introduce only after V2 adjustment model is stable |

---

## 11. Suggested Build Order

1. Finish V1 single source of truth.
2. Add V2 adjustment model.
3. Add discount, scholarship, and waiver UI.
4. Add fine and penalty configuration.
5. Add simple installments.
6. Add refund UI and refund state tracking.
7. Stabilize V2 reports.
8. Design V3 fee structure schema.
9. Add advanced installment templates.
10. Add GST configuration and GST-ready documents.
11. Add ledger and reconciliation.
12. Add production controls, audit exports, and migration tools.

---

## 12. Open Decisions

### V2

- Who can approve discounts above a configured threshold?
- Should penalties auto-apply nightly or only when viewed/generated?
- Should refunds be manual tracking only or integrated with payment gateway APIs?
- Should installment payments support partial installment payment?

### V3

- Which fee categories legally require GST in target customer segments?
- What receipt/invoice numbering rules are required by launch geography?
- Should ledger become the reporting source of truth for all finance views?
- How should multi-branch fee structures inherit from institution-level templates?

---

## 13. Final Recommendation

Do not collapse these versions into one build.

Ship V1 first because it protects trust. Build V2 next because schools need operational flexibility. Build V3 only after real school usage validates the adjustment, installment, and refund model.

This sequence keeps the product shippable while still giving Shiksha a path to a full production-ready fee management system.
