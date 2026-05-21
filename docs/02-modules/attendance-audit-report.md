# Attendance Module Audit Report - Shiksha.cloud

## 1. SCHEMA AUDIT

The database schema for attendance is functional but limited for a full-scale SaaS.

- **Models**: `StudentAttendance`, `AcademicCalendar`.
- **Fields**:
  - `id`: CUID
  - `date`: DateTime (Normalized to IST midnight)
  - `status`: AttendanceStatus Enum
  - `note`: Optional String
  - `recordedBy`: String (Name of the person who marked it)
  - `studentId`: Foreign Key
  - `sectionId`: Foreign Key
  - `academicYearId`: Foreign Key
- **Enums**: `AttendanceStatus` (`PRESENT`, `ABSENT`, `LATE`).
- **Relations**: Correctly linked to `Student`, `Section`, `Teacher` (via section), `AcademicYear`, and `Organization`.
- **Missing Fields**:
  - `excusedReason`: Required if an absence is later marked as excused.
  - `markedById`: Better to have a hard FK to `User.id` instead of just a name string `recordedBy` for audit logs.

---

## 2. SERVER ACTIONS / API AUDIT

The core logic resides in server actions rather than API routes.

- **File**: `lib/data/attendance/mark-attendance.ts`
- **What it does**: Takes a list of student records for a date and performs a Prisma `upsert`. This handles both new marking and editing existing records seamlessly.
- **Returns**: Success object with record counts.
- **Status**: ✅ **Working**.
- **Bugs/Issues**:
  - **Individual Notifications**: It sends notifications in a loop inside the action. For a class of 60 students with 10 absentees, it makes 10 separate calls to the notification engine. This should be batched or moved to a background job.
  - **Timezone**: Correctly uses `toISTDate` which normalizes to `T18:30:00.000Z` (IST Midnight).

---

## 3. PAGES & COMPONENTS AUDIT

- **Mark Attendance Page**: `app/dashboard/attendance/mark/page.tsx`
  - **Role**: Teacher / Admin.
  - **Capability**: Filter by Grade/Section, Date selection, Bulk "Mark All Present", "Copy Previous Day", and AI Note generation.
  - **Status**: ✅ **Complete and Premium**.
- **Section Monitor (Analytics)**: `app/dashboard/attendance/analytics/page.tsx`
  - **Role**: Admin / Principal.
  - **Capability**: Real-time monitoring of which sections have completed attendance today.
  - **Status**: ✅ **Working**.
- **Student/Parent View**: `app/dashboard/my-attendance/page.tsx`
  - **Role**: Student / Parent.
  - **Capability**: Stats cards, Streak, Calendar heatmap, Goal progress.
  - **Status**: ⚠️ **Partially Built**. Visuals are great, but "Weekly/Monthly full logs" and "Download" are missing.

---

## 4. NOTIFICATION TRIGGERS

- **Wired Up**:
  - `STUDENT_ABSENT`: Fired immediately when a record is marked `ABSENT`.
  - `STUDENT_LATE`: Fired immediately when a record is marked `LATE`.
- **Missing / Broken**:
  - **Section Completion**: No alert is sent to the Admin when a teacher finishes the whole section.
  - **Template Variables**: Triggers are missing the `excusedReason` since the status doesn't exist yet.

---

## 5. CALCULATION LOGIC AUDIT

- **File**: `lib/data/attendance/my-attendance.ts`
- **Formula**: `(Present + Late) / Total Recorded Days`.
- **Correctness**:
  - **Late Handling**: Treats Late as Present (Standard).
  - **Total Days**: Currently counts only the days where an attendance record _exists_ in the DB.
  - **Discrepancy**: It DOES NOT cross-reference against `AcademicCalendar`. If a student is absent on a Friday, and Monday is a holiday (not marked), the holiday is ignored. This is correct for percentage, but the "Total School Days" count might look low to parents.

---

## 6. WHAT IS FULLY WORKING

- **Daily Marking**: Robust UI with pre-filling and copy logic.
- **Timezone Stability**: All records anchored to IST midnight.
- **Individual Alerts**: Parents get WhatsApp/SMS instantly for absent/late.
- **Dashboard Stats**: Real-time present/absent/late counts for today.

---

## 7. WHAT IS BROKEN OR INCOMPLETE

- **Student Dashboard Logs**: The "Recent Timeline" shows only the last few days; no full-year list view.
- **Excused Absence**: The status is commented out in the schema and UI; selecting it is impossible.
- **Holiday Integration**: While `AcademicCalendar` exists, it isn't used to "shade" the attendance calendar or exclude days from potential school days.

---

## 8. WHAT IS COMPLETELY MISSING

- **Attendance Export**: No CSV/PDF generation.
- **Download Report**: Button exists in UI but doesn't trigger a download.
- **Admin Trends**: No graph showing attendance trends over the last 3-6 months.
- **Section Completed Alert**: No summary notification sent to organization admins.
- **Attendance Locking**: No logic to prevent editing attendance older than X days.

---

## 9. FINAL SUMMARY

| Feature                 | Status | Notes                                                         |
| ----------------------- | ------ | ------------------------------------------------------------- |
| Mark attendance         | ✅     | Premium UI, fully functional                                  |
| Edit attendance         | ✅     | Handled via upsert in mark-attendance.ts                      |
| Section summary         | ✅     | Monitor dashboard is active                                   |
| Student daily view      | ✅     | Progress rings and cards are working                          |
| Student weekly/monthly  | ⚠️     | Only visual cards; missing detailed table                     |
| Student report download | ❌     | No backend for PDF/CSV generation                             |
| Parent portal view      | ✅     | Mirror of student view but scoped to child                    |
| Parent absent alert     | ✅     | Immediate notification working                                |
| Admin section monitor   | ✅     | Working in /attendance/analytics                              |
| Admin analytics         | ⚠️     | Today's stats ok; Trends missing                              |
| Attendance export       | ❌     | No code found                                                 |
| Notification triggers   | ⚠️     | Bulk/Completion triggers missing                              |
| Excused absence         | ❌     | Commented out in schema                                       |
| Not Marked state        | ✅     | UI shows "Not Marked" and handles nulls                       |
| Holiday exclusion       | ⚠️     | Implicit (not accounted for in total school days)             |
| Calculation accuracy    | ⚠️     | Accurate for recorded days, but total potential days mismatch |

---

# RECOMMENDED FIX ORDER

1. **Schema Fix**: Uncomment `EXCUSED_ABSENT` in `schema.prisma` and add `recordedBy` to `StudentAttendance`. User Relation
2. **Excused Logic**: Update `AttendanceMark` and `markAttendance` to support the new status and optional `excusedReason`.
3. **Export Engine**: Implement a utility to generate CSV/Excel for section-wise monthly reports.
4. **Student Downloads**: Wire up the "Download Report" button on the student/parent portal.
5. **Bulk Notifications**: Add a trigger for "Section Attendance Completed" to notify admins once all students are marked.
6. **Holiday Integration**: Map `AcademicCalendar` to the student attendance heatmap to visually show closed days.
7. **Admin Trends**: Add a simple Line Chart to the Analytics page showing "Attendance %" over time.
