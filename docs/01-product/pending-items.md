# Shiksha.cloud — Pending List + Launch Strategy

> Solo dev · Updated: March 2026 · Goal: Deliver to 1 school ASAP

## 🚨 Tier 0 — Hard Launch Blockers (Beyond Attendance)

Fix these in parallel or immediately after Attendance sprint.

| #   | Blocker                                                      | Dependency                                               |
| --- | ------------------------------------------------------------ | -------------------------------------------------------- |
| 1   | **Notification queue** — background/scheduled jobs           | Blocks attendance alerts, fee reminders, all triggers    |
| 2   | **Real payment gateway** (production PhonePe)                | Blocks fee collection, SaaS billing, notification top-up |
| 3   | **Grading system** not implemented                           | Blocks report cards, exam results, academic performance  |
| 4   | **Teaching Assignments** broken                              | Blocks subject-teacher linking, timetable                |
| 5   | **Notification balance + top-up** flow                       | Blocks schools from sending SMS/WhatsApp                 |
| 6   | **SaaS billing** — collect ₹79/student/month                 | Blocks revenue                                           |
| 7   | **Notice board / fee reminder override**                     | Blocks correct notification routing                      |
| 8   | **Academic Calendar** — only holidays, full calendar pending | Blocks calendar UX                                       |
| 9   | **RBAC full module** — pages still leaking (patch only)      | Blocks security for production                           |

---

## 🔥 Tier 2 — Broken Flows (Fix After Attendance Sprint)

### 🔐 Auth

- [ DONE ] Parent email update → not sending updated invite
- [ DONE ] Sign-out → move to Settings in sidebar

### 👩‍🎓 Students

- [ ] Bulk CSV import + Clerk+DB sync
- [ ] Auto-invite parents on student creation (incl. 2nd parent)
- [ ] Missing profile fields: Birth Place, Previous School
- [ ] Promote to next grade/section

### 👩‍🏫 Teachers

- [ ] Recent Activity feed broken
- [ ] Missing fields: Qualification, Job Title, Substitute flag

### 💰 Fees

- [ ] Fee breakdown UI before Pay Now (₹102 confusion)
- [ ] Payment link in fee assignment SMS
- [ ] Add `pgFee` + `netSettlement` to DB before real money flows
- [ ] PG charge split — decide + implement (who pays the 2.5%?)
- [ ] Offline vs online payment logic (scam risk: school says offline but collected online)
- [ ] Add `refundedAt` + `refundReason` fields to schema now (painful to retrofit)

### 📊 Attendance (After 100% Sprint)

- [ ] Attendance export — CSV / PDF
- [ ] Existing attendance import (bulk historical data)

### 📝 Exams

- [ ] Session not showing in UI (sidebar bug — breaking layout)
- [ ] Auto-enroll students into exams
- [ ] Bulk exam creation
- [ ] AI grading issues
- [ ] Result + Report Card generation broken
- [ ] PDF download broken (hall tickets / report cards)

### 📣 Notifications

- [ ] Template variable mapping broken
- [ ] Triggers not firing: attendance marked, fee paid, lead assigned
- [ ] Notification balance display broken

### 📲 Leads / CRM

- [ ] Instagram + Facebook integration broken
- [ ] Meta Ads connection broken
- [ ] Kanban board missing

### 📢 Notices

- [ ] Override logic needed

---

## 📲 Parent Portal — Pending Pages

| Page                   | Status     |
| ---------------------- | ---------- |
| Exams / Results        | ❌ Pending |
| Today's Timeline       | ⏳ Pending |
| Today's Timetable      | ⏳ Pending |
| Messages               | ⏳ Pending |
| Teacher Remarks        | ⏳ Pending |
| Events & Holidays      | ⏳ Pending |
| Teacher Circulars      | ⏳ Pending |
| Timetable              | ⏳ Pending |
| Homework / Assignments | ⏳ Pending |
| Syllabus               | ⏳ Pending |
| Child Certificates     | ⏳ Pending |
| Parent Settings        | ⏳ Pending |

---

## 🧑‍🏫 Teacher Portal — Pending

- [ ] Today's Schedule (even a mock version is fine for now)

---

## 🟢 Tier 3 — Safe to Defer (Post-Launch, Don't Touch Now)

These will NOT stop you from delivering to one school. Ignore until you're live.

- Clone Fee Categories ("Copy from 2024–25")
- Dynamic Institute Gallery (static is shipped)
- Teacher Attendance
- Salary / Payroll
- Assignments module
- Feedback / Ratings
- Certificate Generator
- Bus Transportation
- Timetable (schema ready — activate post-launch)
- AI Learning / Own LMS
- Voice Navigation
- Full RBAC beyond page guards
- WhatsApp Alexa integration
- Biometric integration

---

## 🗓️ Recommended Sprint Plan

### Week 1 — Attendance 100%

**Goal:** Any teacher at a real school can mark attendance, parents get notified, admin can see reports.

- [ ] Fix attendance calculation logic (all pages + server actions)
- [ ] Get WhatsApp trigger firing on attendance mark (fix notification template variables)
- [ ] Implement attendance export (CSV is fine, PDF later)
- [ ] Test full flow: teacher marks → parent gets WhatsApp → admin sees summary

### Week 2 — Notification Queue + Exam Fix

**Goal:** Notifications are reliable. Exam session shows in UI.

- [ ] Add background job / queue for notifications (Vercel Cron or BullMQ)
- [ ] Fix exam session sidebar bug
- [ ] Fix result + report card generation
- [ ] Test end-to-end: exam → results → report card download

### Week 3 — Payment Gateway (Production)

**Goal:** Real money can flow. One school can pay fees online.

- [ ] Switch PhonePe to production env
- [ ] Add `pgFee` + `netSettlement` to DB
- [ ] Decide + implement PG charge split
- [ ] Test full fee flow: assign → notify → pay → receipt

### Week 4 — Grading + Teaching Assignments

**Goal:** Report cards work. Teachers are correctly linked to subjects.

- [ ] Implement grading system
- [ ] Fix Teaching Assignments
- [ ] Verify report card auto-generation works end-to-end

### Week 5 — SaaS Billing + RBAC

**Goal:** You can actually charge a school. Pages are secure.

- [ ] Implement SaaS billing (collect ₹79/student/month)
- [ ] Complete RBAC full module (beyond page patch)
- [ ] Student bulk import + Clerk sync

### Week 6 — QA + First School Delivery

**Goal:** One school is live. You are collecting money.

- [ ] Run full testing checklist (all core flows)
- [ ] Fix critical bugs from testing
- [ ] Onboard first school
- [ ] Monitor for 1 week

---

## 🧪 Testing Checklist (Run Before Each School Delivery)

### Core Setup

- [ ] Organization switching
- [ ] Grade & Section config + Class Teacher assignment
- [ ] Academic Year switch — multi-year flow
- [ ] Holiday management

### People

- [ ] Student CRUD (create, read, update, delete)
- [ ] Student: document upload + parent linking
- [ ] Teacher CRUD (create, suspend, activate, revoke)

### Academics

- [ ] Attendance marking + calculation
- [ ] Attendance export

### Fees

- [ ] Fee category setup
- [ ] Assign fees to student categories
- [ ] Fee payment + receipt generation
- [ ] Full fee flow (online + offline)

### Exams

- [ ] Exam session creation
- [ ] Exam + student enrollment
- [ ] Result entry
- [ ] Hall ticket generation + download
- [ ] Report card generation + download

### Communication

- [ ] Notice board flow
- [ ] Anonymous complaints flow
- [ ] Notification trigger: attendance marked
- [ ] Notification trigger: fee paid

### Leave For Parent Behalf of student

- [ ] Leave request + approval flow

---

> **Remember:** A school doesn't need 47 features. They need 10 features that work perfectly.
> Ship Attendance 100% → get one school live → everything else follows.
