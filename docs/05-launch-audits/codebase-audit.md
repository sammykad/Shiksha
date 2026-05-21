# Shiksha.cloud — Complete Codebase Audit

> **Date:** 5 April 2026
> **Stack:** Next.js 15, Prisma ORM, Supabase, Clerk Auth
> **Scope:** All `.tsx`/`.ts` files under `/app`, `/components`, `/lib`, `/api`

---

## TASK 1: BROKEN BUTTONS & DEAD LINKS

### 1A. Buttons With No onClick Handler

| # | File | Line | Element | Issue | Fix |
|---|------|------|---------|-------|-----|
| 1 | `components/dashboard/Student/StudentAcademicPerformance.tsx` | ~274 | `<Button><FileDown /> Export</Button>` | No `onClick` — button renders but does nothing | Wire to `toCSV(filteredPerformance)` like `StudentExamsPage.tsx` |
| 2 | `components/dashboard/exam/report-cards/GeneratedReportCardsList.tsx` | ~286 | `<Button variant="outline" disabled><Download /> Download All</Button>` | Hardcoded `disabled`, no handler even if enabled | Implement JSZip + batch PDF generation |

### 1B. Buttons Calling Stubbed/Empty Functions

| # | File | Line | Element | Issue | Fix |
|---|------|------|---------|-------|-----|
| 3 | `components/dashboard/agents/fee-sense-reports.tsx` | ~15, ~43 | `handleDownload` on each report card | `// TODO: Implement report download` + `console.log` only | Connect to `FeeReceiptPDF` or a report download server action |
| 4 | `components/dashboard/exam/HallTicketUI.tsx` | ~92 | `const generateCode = () => {}` | Empty stub — QR/barcode never generates | Wire to `qrcode` library + JsBarcode |
| 5 | `components/dashboard/exam/HallTicketUI.tsx` | ~94 | `const downloadAsPNG = async () => {}` | Empty function — Download PNG does nothing | Implement with `html2canvas` capturing ticket ref |
| 6 | `components/dashboard/exam/HallTicketUI.tsx` | ~96 | `const downloadAsPDF = () => {}` | Empty function — Download PDF does nothing | Implement with `@react-pdf/renderer` document generator |
| 7 | `components/dashboard/exam/AdminExamManagementPage.tsx` | ~362, ~389 | "Export Data" button | `handleExport` only calls `toast.info('Export functionality coming soon')` | Implement CSV export of exam enrollments + results |

### 1C. "Coming Soon" / Toast Warning Buttons

| # | File | Line | Element | Issue | Fix |
|---|------|------|---------|-------|-----|
| 8 | `components/dashboard/Student/StudentAcademicPerformance.tsx` | ~362 | "Download Report" on report cards | `onClick={() => toast.warning("Download feature is not available yet")}` | Connect to `@react-pdf/renderer` report card generator |
| 9 | `components/dashboard/exam/AdminExamManagementPage.tsx` | ~1010 | Exam detail section | Renders `<span>Coming Soon...</span>` | Build enrollment/hall ticket/report card sub-sections |
| 10 | `components/dashboard/Student/CreateStudentForm.tsx` | ~942 | Document upload section | Animated banner: "This Feature is Coming Soon" | Implement UploadThing integration for student documents |
| 11 | `components/dashboard/parent/parent-settings.tsx` | ~18 | Entire settings page | Renders only `<ComingSoon />` component | Build parent settings form (notification prefs, primary parent) |
| 12 | `components/dashboard/teacher/TeacherSettings.tsx` | ~199 | Teacher settings page | Renders only `<ComingSoon />` component | Build teacher profile edit form |
| 13 | `components/dashboard/reports/ReportsHub.tsx` | ~37 | Fee Collection Report card | Status: `"coming_soon"` — no download handler | Build `generateFeeCollectionReport` server action |
| 14 | `components/dashboard/reports/ReportsHub.tsx` | ~37 | Result Analysis Report card | Status: `"coming_soon"` — no download handler | Build `generateResultAnalysisReport` server action |
| 15 | `components/dashboard/reports/ReportCard.tsx` | ~141 | Premium report formats | `<Button disabled><Lock /> Coming Soon</Button>` | Unlock when org plan >= premium, wire to generator |
| 16 | `components/dashboard/admin/settings/BillingSettings.tsx` | ~101 | "Top-up Balance" button | `title="Top-up coming soon — contact support"` | Integrate payment gateway for wallet top-up |
| 17 | `components/website/support/SupportPopup.tsx` | ~325 | "Schedule a Meeting" tab | `<Button className="cursor-not-allowed">Coming Soon</Button>` | Integrate Calendly or build meeting scheduler |
| 18 | `components/dashboard/parent/today-timeline.tsx` | ~322, ~452 | Transport timeline, timetable | "Live tracking coming soon" — static mock data only | Wire to real-time location API |
| 19 | `components/dashboard/integration/integration-dialog-wrapper.tsx` | ~15-53 | 3+ integration cards (SMTP, WhatsApp, etc.) | `comingSoon: true` → disabled + "Coming Soon" badge | Implement each integration's OAuth/connection flow |

### 1D. Commented-Out Functionality

| # | File | Lines | What's Commented Out | Impact |
|---|------|-------|---------------------|--------|
| 20 | `components/dashboard/Fees/FeeReceiptCard.tsx` | ~100-118, ~286-292 | Entire `handleDownload` function + download button | Cannot download from card directly; must use separate component |
| 21 | `components/dashboard/teacher/TeacherDashboard.tsx` | ~60-70 | `MyClassesCard`, `QuickActionsCard`, `StudentPerformanceCard` | Teacher dashboard has less functionality than designed |
| 22 | `lib/menu-list.ts` (PARENT) | Multiple | 6 menu items commented (timetable, homework, syllabus, messages, remarks, events, circulars) | Parent sidebar missing planned features |

---

## TASK 2: MISSING EXPORT FUNCTIONALITY

### 2A. Completely Missing (No Export Button Exists)

| # | Module | Where Button Should Be | Existing Backend Support | Effort |
|---|--------|----------------------|------------------------|--------|
| 1 | **Student List** | `app/dashboard/students/page.tsx` header | `generateStudentReport` in `lib/reports/generate-reports.ts` works | **LOW** — Add button wired to existing server action |
| 2 | **Teacher List** | `app/dashboard/teachers/page.tsx` header | `generateStaffReport` in `lib/reports/generate-reports.ts` works | **LOW** — Add button wired to existing server action |
| 3 | **Lead/CRM** | `components/dashboard/leads/leads-table.tsx` toolbar | None — leads in memory | **LOW** — Simple `toCSV(leads)` client-side |
| 4 | **Notices** | `app/dashboard/notices/page.tsx` header | None | **LOW** — Prisma query + CSV generation |

### 2B. Stubbed (Handler Exists But Does Nothing)

| # | Module | File | Button | Current Behavior | Effort |
|---|--------|------|--------|-----------------|--------|
| 5 | **Exam Detail** | `AdminExamManagementPage.tsx:362` | "Export Data" | `toast.info('coming soon')` | **MEDIUM** — CSV of exam enrollments |
| 6 | **Hall Ticket PNG** | `HallTicketUI.tsx:94` | "Download PNG" | Empty `async () => {}` | **MEDIUM** — `html2canvas` |
| 7 | **Hall Ticket PDF** | `HallTicketUI.tsx:96` | "Download PDF" | Empty `() => {}` | **MEDIUM** — `@react-pdf/renderer` |
| 8 | **Hall Ticket QR** | `HallTicketUI.tsx:92` | QR/Barcode generation | Empty `() => {}` | **LOW** — wire `qrcode` library |
| 9 | **Fee Sense Reports** | `fee-sense-reports.tsx:15` | "Download" on each card | `console.log` only | **LOW** — PDF from report data |
| 10 | **Fee Reconciliation** | `fee-reconciliation/page.tsx:349,562` | "Export CSV" (×2 buttons) | `console.log` only | **LOW** — wire to existing `generateReconciliationReport` |
| 11 | **Server Action** | `app/dashboard/reports/actions.ts:124` | `exportReconciliationData` | Returns `{ data: '', filename }` — empty string | **LOW** — implement CSV/JSON serialization |

### 2C. Partially Working (Shows Warning Toast)

| # | Module | File | Button | Current Behavior | Effort |
|---|--------|------|--------|-----------------|--------|
| 12 | **Student Report Cards** | `StudentAcademicPerformance.tsx:362` | "Download Report" | `toast.warning("Download feature is not available yet")` | **MEDIUM** — `@react-pdf/renderer` document |
| 13 | **Report Cards Bulk** | `GeneratedReportCardsList.tsx:286` | "Download All" | Hardcoded `disabled`, tooltip: "Coming Soon" | **MEDIUM** — JSZip + batch PDF |

### 2D. Working (No Issues)

| # | Module | File | Status |
|---|--------|------|--------|
| 1 | Attendance Export CSV | `attendance-export.tsx` | ✅ Working |
| 2 | Attendance Export PDF | `attendance-export.tsx` | ✅ Working |
| 3 | Fee Receipt Download | `ReceiptDownloadButton.tsx` | ✅ Working |
| 4 | Fee Receipt Multi-Copy | `download-receipt-dialog.tsx` | ✅ Working |
| 5 | Exam CSV (Student) | `StudentExamsPage.tsx` | ✅ Working |
| 6 | Exam CSV (Admin List) | `AdminExamList.tsx` | ✅ Working |
| 7 | Bulk Exam CSV | `BulkExamCreateForm.tsx` | ✅ Working |
| 8 | Bulk Exam Template | `BulkExamCreateForm.tsx` | ✅ Working |
| 9 | Reports — Student Master | `ReportDownloadDialog.tsx` | ✅ Working |
| 10 | Reports — Attendance Summary | `ReportDownloadDialog.tsx` | ✅ Working |
| 11 | Reports — Staff Directory | `ReportDownloadDialog.tsx` | ✅ Working |
| 12 | Reconciliation Download | `ReconciliationDialog.tsx` | ✅ Working |
| 13 | Holiday Template | `holiday-management.tsx` | ✅ Working |

---

## TASK 3: SUMMARY TABLES

### Broken Buttons & Dead Links

| File | Element | Issue | Priority |
|------|---------|-------|----------|
| `StudentAcademicPerformance.tsx:274` | Export button | No onClick handler | HIGH |
| `GeneratedReportCardsList.tsx:286` | Download All | Hardcoded disabled | HIGH |
| `HallTicketUI.tsx:92` | QR/Barcode generation | Empty function | HIGH |
| `HallTicketUI.tsx:94` | Download PNG | Empty function | HIGH |
| `HallTicketUI.tsx:96` | Download PDF | Empty function | HIGH |
| `AdminExamManagementPage.tsx:362` | Export Data | Toast "coming soon" | MEDIUM |
| `fee-sense-reports.tsx:15` | Report download | TODO stub, console.log | MEDIUM |
| `StudentAcademicPerformance.tsx:362` | Download Report | Toast warning | MEDIUM |
| `AdminExamManagementPage.tsx:1010` | Exam detail section | "Coming Soon..." placeholder | MEDIUM |
| `reports/actions.ts:124` | exportReconciliationData | Returns empty string | MEDIUM |
| `fee-reconciliation/page.tsx:349` | Export CSV (×2) | console.log only | MEDIUM |
| `ReportsHub.tsx:37` | Fee Collection Report | "coming_soon" status | MEDIUM |
| `ReportsHub.tsx:37` | Result Analysis Report | "coming_soon" status | MEDIUM |
| `BillingSettings.tsx:101` | Top-up Balance | "coming soon" tooltip | MEDIUM |
| `integration-dialog-wrapper.tsx` | 3+ integration cards | `comingSoon: true` disabled | MEDIUM |
| `CreateStudentForm.tsx:942` | Document upload | "Coming Soon" banner | MEDIUM |
| `parent-settings.tsx:18` | Settings page | `<ComingSoon />` only | LOW |
| `TeacherSettings.tsx:199` | Settings page | `<ComingSoon />` only | LOW |
| `today-timeline.tsx:322` | Transport timeline | Static mock data | LOW |
| `ReportCard.tsx:141` | Premium formats | Disabled + Lock icon | LOW |
| `SupportPopup.tsx:325` | Schedule Meeting | cursor-not-allowed | LOW |
| `FeeReceiptCard.tsx:100-118` | Download handler | Function commented out | LOW |
| `TeacherDashboard.tsx:60-70` | MyClasses/QuickActions | Components commented out | LOW |
| `menu-list.ts` (PARENT) | 6 menu items | Commented out, routes don't exist | LOW |

### Missing Exports

| Module | Status | Effort to Fix |
|--------|--------|---------------|
| Student List | MISSING — no UI button | 15 min — wire to `generateStudentReport` |
| Teacher List | MISSING — no UI button | 15 min — wire to `generateStaffReport` |
| Lead/CRM Pipeline | MISSING — no UI button | 30 min — `toCSV(leads)` client-side |
| Notices | MISSING — no UI button | 30 min — Prisma query + CSV |
| Exam Detail | STUBBED — toast only | 1 hr — CSV export of enrollments |
| Hall Ticket PNG/PDF/QR | STUBBED — empty functions | 2 hrs — `html2canvas` + `@react-pdf/renderer` + `qrcode` |
| Fee Sense Reports | STUBBED — console.log only | 30 min — PDF generation |
| Fee Reconciliation (×2) | STUBBED — console.log only | 30 min — wire to existing generator |
| exportReconciliationData | STUBBED — returns empty | 30 min — implement serialization |
| Student Report Cards | STUBBED — toast warning | 2 hrs — `@react-pdf/renderer` document |
| Report Cards Bulk ZIP | STUBBED — disabled + tooltip | 2 hrs — JSZip + batch PDF |
| Fee Collection Report | MISSING — "coming_soon" | 2 hrs — server action + query |
| Result Analysis Report | MISSING — "coming_soon" | 2 hrs — server action + query |
