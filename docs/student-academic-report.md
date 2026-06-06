# Student Academic Report — Full Year Design

> A comprehensive report card covering a student's entire academic year (April–March), leveraging the existing schema and proposing future enhancements.

---

## Currently Implemented (PDF at `lib/pdf-generator/StudentReportPDF.tsx`)

| Section | Schema Model | Status |
|---------|-------------|--------|
| Organization details | `Organization` | ✅ |
| Academic year | `AcademicYear` | ✅ |
| Student personal info | `Student`, `User` | ✅ |
| Parent/Guardian info | `Parent`, `ParentStudent` | ✅ |
| Fee payment summary | `Fee`, `FeePayment` | ✅ |
| Fee breakdown by category | `FeeCategory` | ✅ |
| Exam results table | `ExamResult`, `Exam` | ✅ |
| Leave records | `Leave` | ✅ |
| Attendance summary (total/present/absent/late/%) | `StudentAttendance` | ✅ |
| Signature fields (Class Teacher, Principal, Parent) | — | ✅ |

---

## Phase 1 — Report Sections Buildable NOW (Schema Ready, Not Yet in PDF)

These sections can be built using **existing schema fields** — no migrations needed.

| # | Section | Schema Source | What to Display |
|---|---------|---------------|-----------------|
| 1 | **Overall Report Card Summary** | `ReportCard` | `totalMaxMarks`, `totalObtained`, `percentage`, `cgpa`, `overallGrade`, `resultStatus` per exam session |
| 2 | **Session-wise Performance** | `ExamSession` + `ReportCard` | Card per session (Midterm, Final, etc.) with aggregated marks, grade, rank |
| 3 | **Subject-wise Aggregated Performance** | `ExamResult[].exam.subject` | Group all results by subject across the year — average %, grade, pass/fail count |
| 4 | **Class Rank & Grade Rank** | `ReportCard.classRank`, `ReportCard.gradeRank` | Position among peers |
| 5 | **Conduct Grade** | `ReportCard.conductGrade` | Behaviour assessment per session |
| 6 | **Teacher Remarks** | `ExamResult.remarks` | Per-subject remarks from teachers |
| 7 | **Principal Remarks** | `ReportCard.principalRemarks` | Overall remarks signed by principal |
| 8 | **Attendance Percentage on Report Card** | `ReportCard.attendancePercent` | Already stored during report card generation |
| 9 | **Monthly Attendance Breakdown** | `StudentAttendance` grouped by month | Table/chart: month-wise present/absent/late |
| 10 | **Late Arrival Count** | `StudentAttendance` where `status: LATE` | Total late arrivals for the year |
| 11 | **Minimum Attendance Warning** | Derived: `attendancePercent < 75%` | Highlight students below 75% threshold |
| 12 | **Fee Payment Timeline** | `FeePayment.paymentDate` | Chronological payment history with receipt numbers |
| 13 | **Outstanding Fee Alert** | `Fee.pendingAmount` + `Fee.dueDate` | Highlight pending fees > 30 days overdue |
| 14 | **Academic Timeline** | `ExamResult[].exam.startDate` | Chronological feed of all exams and results |
| 15 | **Promotion Status** | `ResultStatus` (PROMOTED / FAILED / COMPARTMENT) | Whether student is promoted to next grade |
| 16 | **Subjects Studied Summary** | `Subject` through `Exam` | List of all subjects the student was evaluated in |
| 17 | **Total Working Days** | `StudentAttendance` count | Actual school days with attendance recorded |
| 18 | **Performance Trend** (strongest → weakest subject) | `ExamResult` aggregated per subject | Ranked subject list with % scores |
| 19 | **Exam-wise Breakdown per Subject** | `ExamResult[].obtainedMarks` vs `exam.maxMarks` | For each exam session: what they scored in each subject |
| 20 | **Hall Ticket Reference** | `HallTicket.hallTicketNumber` | Reference number for each exam session hall ticket |
| 21 | **Document Verification Status** | `StudentDocument.verified` | Whether Aadhaar, TC, Birth Certificate are uploaded & verified |
| 22 | **Student Profile Image** | `Student.profileImage` | Photo on report |
| 23 | **Blood Group** | `Student.bloodGroup` | Emergency info |
| 24 | **Student Status** | `Student.status` | ACTIVE / TRANSFERRED / etc. |
| 25 | **Multiple Parents** | `ParentStudent` (isPrimary flag) | Both parents' contact info |

---

## Phase 2 — Report Sections Requiring Minor Schema Additions

These need **new columns on existing models** — small migrations.

| # | Section | Required Schema Change | What to Display |
|---|---------|----------------------|-----------------|
| 26 | **House / House Points** | New `House` model + `houseId` on `Student` | House name, total house points, rank in house |
| 27 | **Subject Teacher Name** | `Exam` or new relation → `Teacher` | Teacher's name who taught each subject |
| 28 | **Per-Subject Attendance** | `subjectId` on `StudentAttendance` | Attendance % per individual subject |
| 29 | **Scholarship / Concession** | `discount` or `scholarship` on `Fee` | Fee waiver details |
| 30 | **Extra Marks / Grace Marks** | `graceMarks` on `ExamResult` | Grace marks awarded |
| 31 | **Grade-wise Pass Threshold** | `passThreshold` per `Grade` | Different passing criteria for different classes |
| 32 | **Curriculum / Board** | `board` on `Grade` or `Organization` | CBSE / ICSE / State Board label on report |

---

## Phase 3 — Future Report Sections (New Models Required)

These require entirely **new Prisma models** — plan before building.

| # | Section | New Model Needed | What to Display |
|---|---------|-----------------|-----------------|
| 33 | **Co-Curricular Activities** | `CoCurricularActivity` (activity name, level, date, achievement, points) | Sports, music, drama, debate, quiz participation |
| 34 | **Achievements & Awards** | `StudentAchievement` (title, category, rank, date, certificate URL) | Inter-school competitions, olympiad ranks, trophies |
| 35 | **Life Skills Assessment** | `LifeSkillAssessment` (skill name, rating 1–5, term, teacher remarks) | Communication, teamwork, leadership, problem-solving |
| 36 | **Physical Education & Yoga** | `PhysicalEducationRecord` (activity, grade, term) | PE assessment, BMI, fitness test results |
| 37 | **Art / Craft / Music Assessment** | `CreativeArtsRecord` (discipline, grade, term) | Art, music, dance evaluations |
| 38 | **Digital Literacy / Computer Skills** | `DigitalLiteracyRecord` (skill, proficiency level) | Computer proficiency assessment |
| 39 | **Work Education / Vocational** | `VocationalRecord` (trade, grade, hours) | Hands-on skill training progress |
| 40 | **Student Health Record** | `HealthRecord` (height, weight, vision, dental, immunization) | Annual health checkup summary |
| 41 | **Teacher Feedback per Subject** | `SubjectFeedback` (subjectId, teacherId, remarks, term) | Detailed qualitative feedback per subject teacher |
| 42 | **Peer Review / Group Work** | `PeerAssessment` (criteria, rating, term) | Collaboration and teamwork evaluation |
| 43 | **Community Service / NCC / NSS** | `CommunityServiceRecord` (activity, hours, organization) | Social service participation log |
| 44 | **Remedial / Extra Classes** | `RemedialRecord` (subject, sessions attended, improvement) | Extra support classes taken |
| 45 | **Career Counselling Notes** | `CounsellingRecord` (session date, counsellor, notes) | Career guidance sessions attended |

---

## Suggested Report Card Layout (One-Year View)

### Page 1 — Header & Personal Info
```
┌─────────────────────────────────────────────────┐
│ [School Logo]     [School Name]                 │
│                   Academic Year 2025-26         │
│                   ANNUAL PROGRESS REPORT        │
├─────────────────────────────────────────────────┤
│ Student Name:    Arjun Sharma                   │
│ Roll Number:     12A-045    Grade: 12  Sec: A   │
│ Date of Birth:   15-Jan-2008    Gender: Male    │
│ Admission Date:  01-Apr-2022    Blood Group: B+ │
│                                                 │
│ Parent:    Priya Sharma   Ph: 9876543210        │
├─────────────────────────────────────────────────┤
│ RESULT:   PASSED    |  84.6%   |   CGPA: 8.6    │
│           Rank in Class: 5/42                   │
│           Rank in Grade: 18/168                 │
└─────────────────────────────────────────────────┘
```

### Page 2 — Subject-wise Performance
```
┌────────────────────────────────────────────────────────────────────┐
│ SUBJECT-WISE PERFORMANCE ACROSS ALL EXAM SESSIONS                 │
├──────────────┬──────────┬──────────┬──────────┬──────────┬────────┤
│ Subject      │ Mid Term │ Prelim   │ Annual   │ Average  │ Grade  │
├──────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ Mathematics  │ 72/100   │ 78/100   │ 85/100   │   78.3%  │   B1   │
│ Science      │ 68/100   │ 75/100   │ 82/100   │   75.0%  │   B2   │
│ English      │ 80/100   │ 84/100   │ 88/100   │   84.0%  │   A2   │
│ Hindi        │ 76/100   │ 80/100   │ 81/100   │   79.0%  │   B1   │
│ Social Stud. │ 70/100   │ 76/100   │ 80/100   │   75.3%  │   B2   │
├──────────────┼──────────┼──────────┼──────────┼──────────┼────────┤
│ TOTAL        │ 366/500  │ 393/500  │ 416/500  │   78.3%  │   B1   │
└──────────────┴──────────┴──────────┴──────────┴──────────┴────────┘
```

### Page 3 — Attendance & Conduct
```
┌────────────────────────────────────────────────┐
│ ATTENDANCE SUMMARY (Academic Year 2025-26)     │
├────────────────────────────────────────────────┤
│ Total Working Days:    220                     │
│ Present:               198  (90.0%)            │
│ Absent:                18   (8.2%)             │
│ Late:                  4    (1.8%)             │
├────────────────────────────────────────────────┤
│ MONTHLY BREAKDOWN:                             │
│ Apr  20/22  |  May 22/24  |  Jun 15/15  | ... │
│ Jul  22/25  |  Aug 23/24  |  Sep 18/20  | ... │
│ ...                                           │
├────────────────────────────────────────────────┤
│ CONDUCT:  A+ (Excellent)                      │
│ REMARKS:                                      │
│   Class Teacher: Diligent and hardworking.    │
│   Principal:     Keep up the good work!       │
└────────────────────────────────────────────────┘
```

### Page 4 — Fee Summary & Co-Curricular
```
┌────────────────────────────────────────────────┐
│ FEE PAYMENT SUMMARY                            │
├───────────────────────┬──────────┬─────────────┤
│ Category              │ Amount   │ Status      │
├───────────────────────┼──────────┼─────────────┤
│ Tuition Fee (Annual)  │ ₹24,000  │ PAID ✅    │
│ Exam Fee              │ ₹3,000   │ PAID ✅    │
│ Lab Fee               │ ₹2,500   │ PAID ✅    │
│ Transport Fee         │ ₹8,000   │ PENDING ⚠️ │
├───────────────────────┼──────────┼─────────────┤
│ TOTAL                 │ ₹37,500  │ PAID 89.3% │
└───────────────────────┴──────────┴─────────────┘

┌────────────────────────────────────────────────┐
│ CO-CURRICULAR & ACHIEVEMENTS                   │
├────────────────────────────────────────────────┤
│ 🏆 Science Olympiad — 2nd Place (State Level) │
│ 🎭 Annual Day Drama — Best Actor              │
│ ⚽ Inter-School Football — Semi-Finalist      │
│ 📚 Debate Club — Active Member                │
└────────────────────────────────────────────────┘
```

### Page 5 — Signatures
```
┌────────────────────────────────────────────────┐
│                                                 │
│   _____________      _____________      _____  │
│  Class Teacher        Principal       Parent   │
│                                                 │
│  Date: ___________                              │
│                                                 │
│  QR Code for Online Verification                │
│  [===================]                          │
│                                                 │
│  This is a computer-generated document.        │
└────────────────────────────────────────────────┘
```

---

## Grading Toggle Controls (Already Built)

The `GradingSettings` component at `components/dashboard/admin/settings/GradingSettings.tsx` allows admins to toggle:

| Toggle | Effect |
|--------|--------|
| `showAttendance` | Attendance % on report card |
| `showConductGrade` | Behaviour/conduct grade |
| `showPrincipalRemarks` | Principal's remarks field |
| `showRank` | Class / grade rank |
| `showPercentile` | Percentile score |
| Archetype presets | School / HigherEd / TestPrep / Flexible |
| Grade band presets | CBSE, CGPA, GPA, Standard, Simple |

These toggles should be **respected** by the report PDF generator.

---

## Implementation Priority

| Priority | Section | Effort | Impact |
|----------|---------|--------|--------|
| P0 | Session-wise report card (ReportCard data) | Low | High |
| P0 | Subject-wise aggregated performance | Medium | High |
| P0 | Class rank & grade rank | Low | High |
| P0 | Attendance vs 75% threshold warning | Low | High |
| P1 | Monthly attendance breakdown | Medium | Medium |
| P1 | Principal & teacher remarks | Low | Medium |
| P1 | Conduct grade per session | Low | Medium |
| P1 | Fee payment timeline | Low | Medium |
| P2 | Co-curricular activities | High | Medium |
| P2 | House system | Medium | Low |
| P3 | Life skills assessment | High | Medium |
| P3 | Health record | Medium | Low |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/pdf-generator/StudentReportPDF.tsx` | Current PDF report (448 lines) |
| `lib/data/student/get-student-report.ts` | Data fetching for student report |
| `lib/data/student/get-student-performance.ts` | Performance data (exam results, report cards) |
| `lib/data/exam/report-card-generation.ts` | Report card generation logic |
| `lib/data/exam/grade-utils.ts` | Grading calculation helpers |
| `components/dashboard/Student/student-report-dialog.tsx` | UI dialog to trigger report download |
| `components/dashboard/admin/settings/GradingSettings.tsx` | Toggle controls for report card fields |
| `types/student-performance.ts` | Type definitions |
| `types/reports.ts` | Report system types |
| `components/dashboard/students/[id]/page.tsx` | Student detail page (1556 lines, academic tab) |
| `prisma/schema.prisma` | All models listed above |

---

## Suggested Next Steps

1. **Augment `getStudentReport()`** to include `ReportCard`, attendance monthly grouping, parent details
2. **Update `StudentReportPDF.tsx`** to add session-wise report card summary + subject-wise aggregation table
3. **Update the student-report-dialog UI** to let users toggle new sections
4. **Respect GradingSettings toggles** in the PDF generator
5. **Add CoCurricularActivity + StudentAchievement models** for Phase 3
