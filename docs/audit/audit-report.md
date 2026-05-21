# 🔴 Shiksha.cloud (Nexus): Full Data & Operational Integrity Audit

As requested, I have audited the primary daily-use operations for Shiksha.cloud (codename: antigravity) against the Prisma schema and business logic.

---

## 1. 🏫 MORNING OPERATIONS
| Question | Status | Audit Findings |
| :--- | :---: | :--- |
| **Bulk Attendance?** | ✅ READY | `markAttendance` accepts a `records` array and uses a `$transaction` to `upsert` all entries. |
| **Double Marking?** | ✅ READY | `@@unique([studentId, date])` in `StudentAttendance` (line 793) prevents duplicates. The second marking updates the first. |
| **No AcademicYear?** | 🟡 WARNING | `markAttendance` calls `getCurrentAcademicYearId()`. If no year is set as "Current" for the org, it throws an error. Operations stop entirely. |
| **Performance?** | ✅ READY | `@@index([sectionId, date])` (line 797) supports fast morning queries for 500+ student sections. |

---

## 2. 💰 FEE COLLECTION
| Question | Status | Audit Findings |
| :--- | :---: | :--- |
| **Atomicity?** | ✅ READY | `recordOfflinePayment` uses a transaction to create `FeePayment` and update `Fee.paidAmount`. |
| **Race Conditions?** | 🟡 WARNING | `receiptNumber` is `@unique`. Random UUIDs minimize risk, but if a collision occurs, the transaction rolls back safely. No business logic handles receipt retries. |
| **Overpayment?** | 🟡 WARNING | Current logic calculates `pendingAmount = Math.max(total - paid, 0)`. It does not explicitly block a payment that exceeds the total (resulting in a negative pending amount in some edge cases). |
| **Wallet Balance?** | 🔴 BLOCKER | `Organization.walletBalance` is present but **IGNORED** by `engine.ts` and `FeeSenseAgent`. SMS/WhatsApp will proceed even at ₹0, causing platform revenue loss. |

---

## 3. 📋 STUDENT MANAGEMENT
| Question | Status | Audit Findings |
| :--- | :---: | :--- |
| **Onboarding Order** | ✅ READY | Order: Clerk User → DB User → Student. If DB fails, Clerk user is deleted via logic in `actions.ts`. |
| **Roll Number Race?** | 🟡 WARNING | `@@unique([organizationId, rollNumber])` exists. If two admins type "101" at once, one will hit a DB error. Application needs to handle this gracefully. |
| **Grade Mismatch?** | 🟡 WARNING | `Student` has both `gradeId` and `sectionId`. There is no schema constraint ensuring `section.gradeId == student.gradeId`. Data drift is possible. |
| **Status Side-Effects** | 🔴 BLOCKER | Changing student status to `TRANSFERRED` or `DROPPED` has **no cascade**. Their `Fee` records stay `UNPAID` and appear in overdue reports. |

---

## 4. 📢 NOTIFICATIONS
| Question | Status | Audit Findings |
| :--- | :---: | :--- |
| **Idempotency?** | ✅ READY | `idempotencyKey` on both `Notification` (line 1212) and `NotificationLog` (line 1247) ensures exactly-once delivery within 24h. |
| **Logic Orphans?** | 🟡 WARNING | `Notification` allows `userId`, `studentId`, and `parentId` to be null (lines 1188-1190). An orphaned notification can exist if logic fails. |
| **Settings Bypass?** | ✅ READY | `NotificationSetting.isActive` (line 1157) is checked in `notify.ts` before dispatch. |
| **Stale Tokens?** | 🟡 WARNING | `DeviceToken` is unbounded with no expiry. Stale tokens will result in 400 errors from FCM/PN, slowing down the engine over time. |

---

## 5. 📅 LEAVE MANAGEMENT
| Question | Status | Audit Findings |
| :--- | :---: | :--- |
| **ApprovedBy?** | 🟡 WARNING | `approvedBy` is optional `String?` (line 1415). A leave can be approved without a traceable admin ID if the server action is lazy. |
| **Siloed Systems?** | ✅ FIXED | **Improved Today.** Attendance marking now cross-checks the `Leave` table to suppress "Absent" alerts for students on approved leave. |
| **Overlap Check?** | 🔴 BLOCKER | There is **no DB constraint** preventing a user from applying for overlapping Sick and Casual leave on the same date. |

---

## 6. 🎯 LEAD CRM
| Question | Status | Audit Findings |
| :--- | :---: | :--- |
| **Unassigned Leads** | ✅ READY | `assignedToUserId` is optional. Unassigned leads are filterable by orgId. |
| **Duplicate Activity**| 🟡 WARNING | `LeadActivity` (line 1517) has no unique constraint or business idempotency. Double-clicking "Contacted" creates multiple logs. |
| **Double Conversion**| ✅ READY | `convertedToStudentId` is `@unique` (line 1491). One Lead cannot be converted into two Students. |

---

## 7. 📊 SCHEDULED JOBS
| Question | Status | Audit Findings |
| :--- | :---: | :--- |
| **Status Safety** | 🟡 WARNING | `ScheduledJob.status` is a `String` (line 1293), not an enum. Illegal statuses can be written if logic isn't careful. |
| **Concurrency**   | 🟡 WARNING | No mutex/lock mechanism in `schema.prisma`. Multiple workers might pick up the same `PENDING` job unless using `SKIP LOCKED`. |
| **Table Bloat**   | 🔴 BLOCKER | `NotificationLog` and `ScheduledJob` tables are **unbounded**. At scale, these will hit millions of rows within months, slowing down all org queries. |

---

## 📈 QUERY PERFORMANCE (Daily Index Audit)
- ✅ **Fees**: `@@index([organizationId, academicYearId, status])` exists on `Fee`.
- ✅ **Attendance**: `@@index([sectionId, date])` exists on `StudentAttendance`.
- ❌ **Leads**: `@@index([organizationId, status, nextFollowUpAt])` — **MISSING**. Currently has `[organizationId, status, phone]`. Follow-up queries will slow down.
- 🟡 **Notices**: `targetGrades` is a `String[]`. Postgres GIN index is needed for efficient array filtering at scale. Missing.

---

## 🔴 DAILY OPERATION RISK MATRIX

| Operation          | Risk Level | Failure Mode                             | Fix Needed? |
|--------------------|------------|------------------------------------------|-------------|
| **Mark Attendance**| 🟢 SAFE   | Multi-tenancy & ID conflict handled      | No          |
| **Collect Fee**    | 🟡 WARNING | Negative balance possible (Overpayment)  | Yes         |
| **Send Notification**| 🔴 BLOCKER | **No Wallet check** (Monetization risk) | **URGENT**  |
| **Approve Leave**  | 🟡 WARNING | Overlapping leaves allowed               | Yes         |
| **Run FeeSense AI**| ✅ READY   | Systematic processing with recovery      | No          |
| **Convert Lead**   | ✅ READY   | Prevented multiple students per lead     | No          |
| **Add New Student**| 🟡 WARNING | Manual roll number race conditions       | Yes         |
| **Publish Notice** | 🟡 WARNING | No visibility index for array filters    | Yes         |

---

### 🚨 Critical Blockers for Production
1.  **Monetization Risk**: Implement `walletBalance` deduction in `engine.ts`.
2.  **Lifecycle End**: Add a `PromotionHistory` or `Migration` logic to move students between grades at year-end.
3.  **Data Pruning**: Implement a TTL or cleanup job for `NotificationLog` and `ScheduledJob`.

**Verdict**: The schema is **Operations-Safe** but **Monetization-Risky** and **Scale-Sensitive**.
