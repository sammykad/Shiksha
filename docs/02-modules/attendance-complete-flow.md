# 📘 Attendance Module - Complete Architecture Documentation

**Generated:** March 29, 2026  
**Module:** Student Attendance Management  
**Version:** 2.0

---

## 1. Overview

### What the Attendance Module Does

The attendance module is a comprehensive system for tracking, managing, and reporting student attendance across all educational institutions (K-12 schools, colleges, coaching centers). It provides real-time attendance marking, automated parent notifications, detailed analytics, and multi-format reporting.

### Key Features

- **Real-time attendance marking** (PRESENT, LATE, ABSENT, HALF_DAY)
- **QR code-based attendance** for quick marking
- **Automated parent notifications** via WhatsApp, SMS, Email, Push
- **Calendar visualization** with holiday integration
- **Weekly/Monthly/Annual reports**
- **PDF export** with professional formatting
- **Email reports** to parents
- **Role-based dashboards** (Admin, Teacher, Student, Parent)
- **Section-wise tracking** with completion stats
- **Attendance streaks** and analytics

### Roles Involved

| Role | Permissions |
|------|-------------|
| **Admin** | View all attendance, export reports, mark attendance for any section, view analytics dashboard |
| **Teacher** | Mark attendance for assigned sections, view section-wise stats, receive completion reminders |
| **Student** | View own attendance, download PDF reports, view calendar, check attendance percentage |
| **Parent** | View children's attendance, receive weekly email reports, view monthly breakdown, get absence alerts |

---

## 2. Data Model

### StudentAttendance Schema

```prisma
model StudentAttendance {
  id             String           @id @default(cuid())
  date           DateTime
  status         AttendanceStatus
  note           String?
  recordedBy     String
  studentId      String
  sectionId      String
  academicYearId String
  
  student        Student          @relation(fields: [studentId], references: [id])
  section        Section          @relation(fields: [sectionId], references: [id])
  academicYear   AcademicYear     @relation(fields: [academicYearId], references: [id])
  
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@unique([studentId, date])  // One attendance record per student per day
}
```

### Fields Description

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID) |
| `date` | DateTime | Attendance date (stored in UTC, converted to IST) |
| `status` | AttendanceStatus | Enum: PRESENT, LATE, ABSENT, HALF_DAY |
| `note` | String? | Optional note (e.g., "Medical appointment") |
| `recordedBy` | String | Teacher name who marked attendance |
| `studentId` | String | Foreign key to Student |
| `sectionId` | String | Foreign key to Section |
| `academicYearId` | String | Foreign key to AcademicYear |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### AttendanceStatus Enum

```prisma
enum AttendanceStatus {
  PRESENT
  LATE
  ABSENT
  HALF_DAY
}
```

| Status | Description | Counted As Present |
|--------|-------------|-------------------|
| `PRESENT` | Student attended full day | ✅ Yes |
| `LATE` | Student arrived late but attended | ✅ Yes (for percentage) |
| `ABSENT` | Student was absent | ❌ No |
| `HALF_DAY` | Student attended half day | ⚠️ Configurable |

---

## 3. Server Side Flows

### 3.1 mark-attendance.ts — Mark Attendance

**File:** `lib/data/attendance/mark-attendance.ts`

**Purpose:** Allows teachers to mark attendance for an entire section in a single operation.

**Inputs:**
```typescript
interface markAttendanceProps {
  sectionId: string;
  selectedDate: Date;
  records: {
    studentId: string;
    status: AttendanceStatus;
    note?: string;
  }[];
}
```

**Process Flow:**
1. Convert date to IST timezone
2. Fetch organizationId, academicYearId, and current user in parallel
3. Fetch section details with students
4. Use Prisma transaction to upsert attendance records
5. Trigger notifications for ABSENT and LATE students
6. Revalidate dashboard and analytics pages

**DB Queries:**
```typescript
// 1. Fetch section with students
prisma.section.findFirstOrThrow({
  where: { id: sectionId, organizationId },
  select: {
    id: true,
    name: true,
    grade: { select: { grade: true } },
    students: { select: { id: true, firstName: true, lastName: true } },
  },
});

// 2. Upsert attendance records (transaction)
prisma.studentAttendance.upsert({
  where: { studentId_date: { studentId, date } },
  update: { status, updatedAt: new Date(), recordedBy, academicYearId, note },
  create: { studentId, academicYearId, date, status, note, recordedBy, sectionId },
});

// 3. Send notifications for ABSENT students
notify.attendance.absent({
  attendanceId: record.id,
  recipients: [{ studentId: record.studentId }],
  variables: { studentName, date, grade, section },
});

// 4. Send notifications for LATE students
notify.attendance.late({
  attendanceId: record.id,
  recipients: [{ studentId: record.studentId }],
  variables: { studentName, date, time, grade, section },
});
```

**Outputs:**
```typescript
{
  success: true,
  message: "Attendance marked successfully",
  recordsUpdated: number
}
```

**Notification Triggers:**
- ABSENT → Triggers `notify.attendance.absent()` → Parent notified via WhatsApp/SMS/Email/Push
- LATE → Triggers `notify.attendance.late()` → Parent notified via WhatsApp/SMS/Email/Push

---

### 3.2 get-attendance-completion-stats.ts — Admin Dashboard Stats

**File:** `lib/data/attendance/get-attendance-completion-stats.ts`

**Purpose:** Provides real-time attendance completion statistics for admin dashboard.

**Inputs:**
```typescript
{
  date: Date = new Date(),
  options: { page?: number; pageSize?: number } = {}
}
```

**Process Flow:**
1. Fetch all sections with students and attendance for the date
2. Calculate per-section attendance percentage
3. Aggregate global statistics
4. Return paginated results with stats

**DB Queries:**
```typescript
prisma.section.findMany({
  where: { organizationId },
  include: {
    grade: { select: { grade: true } },
    students: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
      },
    },
    StudentAttendance: {
      where: { date: istDate },
      select: {
        studentId: true,
        status: true,
        note: true,
        recordedBy: true,
      },
    },
  },
  orderBy: [
    { grade: { grade: 'asc' } },
    { name: 'asc' }
  ],
});
```

**Counting Logic:**
```typescript
// Deduplicate by studentId
const attendanceMap = new Map<string, any>();
section.StudentAttendance.forEach((a) => attendanceMap.set(a.studentId, a));

const recordedCount = attendanceMap.size;
const presentCount = Array.from(attendanceMap.values())
  .filter((a) => a.status === 'PRESENT' || a.status === 'LATE')
  .length;

// Percentage calculation
const percentage = (recordedCount / totalStudents) * 100;
```

**Outputs:**
```typescript
{
  sections: SectionAttendanceDetails[],  // Paginated
  stats: {
    totalSections: number,
    completedSections: number,
    pendingSections: number,
    totalStudents: number,
    totalPresent: number,
    completionPercentage: number,
    attendancePercentage: number,
    totalPages: number,
    currentPage: number,
  }
}
```

---

### 3.3 get-child-attendance-data.ts — Parent View

**File:** `lib/data/parent/attendance-monitor/get-child-attendance-data.ts`

**Purpose:** Fetches child's attendance data for parent dashboard calendar view.

**Inputs:** None (uses authenticated user context)

**Process Flow:**
1. Get authenticated user ID and organization
2. Get selected child ID from parent's context
3. Fetch student with all attendance records
4. Fetch academic calendar events (holidays)
5. Return formatted data for calendar component

**DB Queries:**
```typescript
// 1. Get parent-student relationship
prisma.parentStudent.findFirst({
  where: {
    parent: { userId },
    studentId: selectedChildId,
    student: { organizationId: orgId },
  },
  select: {
    student: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        grade: { select: { grade: true } },
        section: { select: { name: true } },
        StudentAttendance: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            date: true,
            status: true,
            note: true,
            recordedBy: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    },
  },
});

// 2. Get academic calendar (holidays)
prisma.academicCalendar.findMany({
  where: {
    organizationId: orgId,
    academicYearId,
  },
  select: {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    type: true,
    reason: true,
    isRecurring: true,
  },
});
```

**Outputs:**
```typescript
{
  attendanceRecords: StudentAttendanceRecord[],
  academicCalendarEvents: AcademicCalendarEvent[],
  student: {
    id: string,
    firstName: string,
    lastName: string,
    grade: { grade: string },
    section: { name: string },
  } | null
}
```

---

### 3.4 get-weekly-attendance-report.ts — Weekly Report

**File:** `lib/data/attendance/get-weekly-attendance-report.ts`

**Purpose:** Generates weekly attendance report for email/PDF export.

**Inputs:**
```typescript
{
  studentId: string,
  weekOffset: number = 0  // 0 = current week, -1 = last week, +1 = next week
}
```

**Process Flow:**
1. Calculate week start (Monday) and end (Sunday) dates
2. Fetch attendance records for the week
3. Build daily records (including unmarked days as NOT_MARKED)
4. Calculate cumulative yearly stats
5. Return formatted report data

**DB Queries:**
```typescript
// 1. Get student profile
prisma.student.findUnique({
  where: { id: studentId },
  include: { grade: true, section: true, organization: true },
});

// 2. Get weekly attendance
prisma.studentAttendance.findMany({
  where: {
    studentId,
    date: { gte: weekStart, lte: weekEnd },
  },
  orderBy: { date: 'asc' },
});

// 3. Get yearly cumulative stats
prisma.studentAttendance.findMany({
  where: { studentId },
});
```

**Counting Logic:**
```typescript
const totalPresentYear = yearRows.filter((r) => r.status === 'PRESENT').length;
const totalLateYear = yearRows.filter((r) => r.status === 'LATE').length;

// Attendance % = (PRESENT + LATE) / TOTAL
const yearPercentage = ((totalPresentYear + totalLateYear) / totalPossibleYear) * 100;
```

**Outputs:**
```typescript
{
  student: {
    id: string,
    firstName: string,
    lastName: string,
    rollNumber: string,
    grade: { grade: string },
    section: { name: string },
  },
  attendanceRecords: {
    date: string,
    status: AttendanceStatus | 'NOT_MARKED',
    note: string | null,
  }[],
  weekRange: {
    startDate: string,
    endDate: string,
  },
  organization: {
    name: string,
    logo: string,
    contactEmail: string,
    contactPhone: string,
  },
  cumulativeStats: {
    totalDaysPresent: number,
    totalDaysLate: number,
    totalPossibleDays: number,
    attendancePercentage: number,
  },
  weekOffset: number,
}
```

---

### 3.5 my-attendance.ts — Student Dashboard

**File:** `lib/data/attendance/my-attendance.ts`

**Purpose:** Fetches comprehensive attendance data for student dashboard.

**Inputs:**
```typescript
{
  userId: string  // Student's user ID
}
```

**Process Flow:**
1. Fetch student profile
2. Fetch all attendance records for academic year
3. Fetch holiday data
4. Calculate monthly, annual, and overall stats
5. Calculate current attendance streak
6. Determine today's status

**DB Queries:**
```typescript
// 1. Get student
prisma.student.findUnique({
  where: { userId },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    rollNumber: true,
  },
});

// 2. Get attendance records
prisma.studentAttendance.findMany({
  where: { studentId: student.id, academicYearId },
  orderBy: { date: 'desc' },
});

// 3. Get holidays
prisma.academicCalendar.findMany({
  where: { organizationId, academicYearId },
});
```

**Counting Logic (Fixed Standard):**
```typescript
function calcStats(records: StudentAttendance[]): AttendanceStats {
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'PRESENT').length;
  const lateDays = records.filter((r) => r.status === 'LATE').length;
  const absentDays = records.filter((r) => r.status === 'ABSENT').length;
  
  // Attendance % = (PRESENT + LATE) / TOTAL
  const percentage = ((presentDays + lateDays) / totalDays) * 100;
  
  return { totalDays, presentDays, lateDays, absentDays, percentage };
}

// Current streak calculation
let currentStreak = 0;
for (const r of attendanceData) {
  if (r.status === 'PRESENT' || r.status === 'LATE') currentStreak++;
  else break;
}
```

**Outputs:**
```typescript
{
  student: { id, firstName, lastName, rollNumber },
  attendanceData: StudentAttendance[],
  holidayData: AcademicCalendar[],
  recentAttendance: StudentAttendance[],  // Last 7 records
  todayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED',
  monthlyStats: AttendanceStats,
  annualStats: AttendanceStats,
  overallStats: AttendanceStats,
  currentStreak: number,
}
```

---

### 3.6 getMonthlyAttendance.ts — Parent Monthly View

**File:** `lib/data/parent/attendance-monitor/getMonthlyAttendance.ts`

**Purpose:** Groups attendance by month for parent dashboard.

**Inputs:**
```typescript
{
  childId: string
}
```

**Process Flow:**
1. Fetch all attendance records for child
2. Group by month and year
3. Calculate monthly stats (present, absent, late, percentage)
4. Return array of monthly summaries

**DB Queries:**
```typescript
prisma.studentAttendance.findMany({
  where: { studentId: childId },
  select: { date: true, status: true },
});
```

**Counting Logic:**
```typescript
const monthlyAttendanceMap = new Map<string, {
  month: string;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
}>();

for (const record of attendanceRecords) {
  const monthKey = `${year}-${monthName}`;
  
  if (!monthlyAttendanceMap.has(monthKey)) {
    monthlyAttendanceMap.set(monthKey, {
      month: monthName,
      year,
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
    });
  }
  
  const monthlyStats = monthlyAttendanceMap.get(monthKey)!;
  monthlyStats.totalDays += 1;
  
  if (record.status === 'PRESENT') {
    monthlyStats.presentDays += 1;
  } else if (record.status === 'LATE') {
    monthlyStats.lateDays += 1;
  } else {
    monthlyStats.absentDays += 1;
  }
}

// Percentage = presentDays / totalDays
const percentage = stats.totalDays > 0
  ? Math.round((stats.presentDays / stats.totalDays) * 100)
  : 0;
```

**Outputs:**
```typescript
Array<{
  month: string;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}>
```

---

### 3.7 get-student-dashboard-stats.ts — Student Stats

**File:** `lib/data/student/get-student-dashboard-stats.ts`

**Purpose:** Provides attendance rate and other stats for student dashboard.

**Inputs:**
```typescript
{
  studentId: string
}
```

**Counting Logic:**
```typescript
const total = attendanceRecords.length;
const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length;

// Attendance Rate = (PRESENT + LATE) / TOTAL
const attendanceRate = total > 0
  ? Math.round(((presentCount + lateCount) / total) * 100)
  : 0;
```

**Outputs:**
```typescript
{
  attendanceRate: number,
  attendancePresent: number,
  attendanceLate: number,
  attendanceTotal: number,
  gpa: number,
  grade: string,
  upcomingExams: Exam[],
  pendingAssignments: number,
}
```

---

### 3.8 get-teacher-dashboard-stats.ts — Teacher Stats

**File:** `lib/data/teacher/get-teacher-dashboard-stats.ts`

**Purpose:** Provides attendance statistics for teacher dashboard (all assigned sections).

**Inputs:** None (uses authenticated teacher context)

**Process Flow:**
1. Get teacher with teaching assignments and sections
2. Get all section IDs (teaching + class teacher)
3. Fetch attendance stats for today and month
4. Calculate percentages

**DB Queries:**
```typescript
// Today's attendance
prisma.studentAttendance.count({
  where: {
    sectionId: { in: uniqueSectionIds },
    date: today,
    status: 'PRESENT',  // or 'LATE'
  },
});

// Monthly attendance
prisma.studentAttendance.count({
  where: {
    sectionId: { in: uniqueSectionIds },
    date: {
      gte: new Date(today.getFullYear(), today.getMonth(), 1),
      lte: today,
    },
    status: { in: ['PRESENT', 'LATE'] },
  },
});
```

**Counting Logic:**
```typescript
// Today's percentage = (PRESENT + LATE) / TOTAL_STUDENTS
const todayAttendancePercentage = totalStudents
  ? Math.round(((todayPresent + todayLate) / totalStudents) * 100)
  : 0;

// Month percentage = (PRESENT + LATE) / TOTAL_RECORDED
const monthAttendancePercentage = monthTotal
  ? Math.round((monthPresent / monthTotal) * 100)
  : 0;
```

**Outputs:**
```typescript
{
  teacher: Teacher,
  totalStudents: number,
  todayAttendance: {
    total: number,
    present: number,
    late: number,
    absent: number,
    percentage: number,
    markedToday: number,
  },
  monthAttendance: {
    percentage: number,
    totalRecords: number,
  },
  pendingComplaints: number,
  recentNotices: Notice[],
  upcomingHolidays: AcademicCalendar[],
  classPerformance: any[],
}
```

---

### 3.9 get-reports-data.ts — Report Generation

**File:** `lib/data/reports/get-reports-data.ts`

**Purpose:** Generates attendance summary reports for export.

**Inputs:**
```typescript
{
  filters?: ReportFilters  // gradeId, sectionId, dateRange
}
```

**Counting Logic:**
```typescript
const totalDays = student.StudentAttendance.length;
const presentDays = student.StudentAttendance.filter(
  (a) => a.status === 'PRESENT' || a.status === 'LATE'
).length;
const lateDays = student.StudentAttendance.filter(
  (a) => a.status === 'LATE'
).length;
const absentDays = student.StudentAttendance.filter(
  (a) => a.status === 'ABSENT'
).length;

// Attendance % = (PRESENT + LATE) / TOTAL
const attendancePercentage = totalDays > 0
  ? Math.round((presentDays / totalDays) * 100)
  : 0;
```

**Outputs:**
```typescript
AttendanceReportData[]: Array<{
  studentId: string,
  rollNumber: string,
  studentName: string,
  grade: string,
  section: string,
  totalDays: number,
  presentDays: number,
  absentDays: number,
  lateDays: number,
  attendancePercentage: number,
}>
```

---

## 4. Counting Logic Standard (FIXED)

### Standard Counting Rules

| Metric | Counted As | Formula |
|--------|-----------|---------|
| **Present Days** | PRESENT only | `count(status === 'PRESENT')` |
| **Late Days** | LATE only | `count(status === 'LATE')` |
| **Absent Days** | ABSENT only | `count(status === 'ABSENT')` |
| **Attendance %** | PRESENT + LATE | `(PRESENT + LATE) / TOTAL * 100` |

### Where Combined Count is Used

**Combined (PRESENT + LATE):**
- ✅ Attendance percentage calculation
- ✅ Attendance rate on dashboards
- ✅ Completion stats
- ✅ Report generation

**Distinct (PRESENT only):**
- ✅ Monthly breakdown (presentDays field)
- ✅ Streak calculation (both count as streak continuation)
- ✅ Historical reports

### Example Calculation

```typescript
// Sample data
const records = [
  { status: 'PRESENT' },  // Day 1
  { status: 'LATE' },     // Day 2
  { status: 'ABSENT' },   // Day 3
  { status: 'PRESENT' },  // Day 4
  { status: 'LATE' },     // Day 5
];

// Counts
const total = 5;
const present = 2;  // PRESENT only
const late = 2;     // LATE only
const absent = 1;   // ABSENT only

// Attendance % = (PRESENT + LATE) / TOTAL
const percentage = ((2 + 2) / 5) * 100 = 80%;
```

---

## 5. Client Side UI Flow

### 5.1 attendance-mark.tsx — Teacher Marking Interface

**File:** `components/dashboard/StudentAttendance/attendance-mark.tsx`

**Purpose:** Allows teachers to mark attendance for entire section.

**Data Received:**
- Section ID
- Selected date
- List of students with roll numbers

**User Flow:**
1. Teacher selects section and date
2. System loads students with previous day's attendance
3. Teacher marks each student (PRESENT/ABSENT/LATE)
4. Optional: Add notes for absent/late students
5. Click "Save Attendance"
6. System calls `markAttendance()` server action
7. Toast notification confirms success
8. Parent notifications triggered automatically

**Components Rendered:**
- Section selector dropdown
- Date picker calendar
- Student list with radio buttons (PRESENT/ABSENT/LATE)
- Note textarea for each student
- Save button with loading state
- QR scanner option (for quick marking)

---

### 5.2 attendance-calendar.tsx — Parent/Student Calendar View

**File:** `components/dashboard/StudentAttendance/attendance-calendar.tsx`

**Purpose:** Visual calendar showing attendance with holiday integration.

**Data Received:**
```typescript
{
  attendanceRecords: StudentAttendanceRecord[],
  academicCalendarEvents: AcademicCalendarEvent[],
  student: Student,
}
```

**User Flow:**
1. Parent/student views monthly calendar
2. Each day shows colored badge (Green=Present, Red=Absent, Yellow=Late)
3. Holidays shown with special icon
4. Click day to view details or add note
5. Hover shows monthly stats
6. Export button downloads PDF

**Components Rendered:**
- Monthly calendar grid
- Day badges with status colors
- Holiday indicators
- Monthly stats card (present/absent/late/percentage)
- Export PDF button
- Month navigation (prev/next)

---

### 5.3 attendance-table.tsx — Admin/Reports View

**File:** `components/dashboard/StudentAttendance/attendance-table.tsx`

**Purpose:** Tabular view of attendance records with filtering and export.

**Data Received:**
```typescript
{
  records: AttendanceRecord[],
  organization?: Organization,
}
```

**User Flow:**
1. Admin views all attendance records
2. Filter by date range, grade, section
3. Sort by date, student name, status
4. Select records for bulk actions
5. Export to PDF or Excel

**Components Rendered:**
- Data table with pagination
- Filter controls (date, grade, section)
- Sort headers
- Bulk selection checkboxes
- Export dropdown (PDF/Excel)
- Delete selected action

---

### 5.4 attendance-skyline.tsx — Visual Timeline

**File:** `components/dashboard/StudentAttendance/attendance-skyline.tsx`

**Purpose:** Visual timeline showing attendance patterns over time.

**Data Received:**
- Array of attendance records sorted by date

**User Flow:**
1. User sees horizontal timeline of attendance
2. Green blocks = Present, Red = Absent, Yellow = Late
3. Patterns visible at a glance (streaks, absences)
4. Hover shows date and details

**Components Rendered:**
- Horizontal timeline
- Colored blocks per day
- Tooltip on hover
- Streak indicators

---

### 5.5 WeeklyAttendanceReportCard.tsx — Parent Weekly Report

**File:** `components/dashboard/StudentAttendance/WeeklyAttendanceReportCard.tsx`

**Purpose:** Shows weekly attendance summary for parents.

**Data Received:**
```typescript
{
  student: Student,
  attendanceRecords: WeeklyAttendanceRecord[],
  weekRange: { startDate, endDate },
  cumulativeStats: { totalDaysPresent, totalPossibleDays, attendancePercentage },
}
```

**User Flow:**
1. Parent views weekly report card
2. See each day's status (Mon-Fri)
3. View weekly percentage
4. Compare with cumulative yearly stats
5. Navigate to previous/next weeks

**Components Rendered:**
- Week navigation (prev/next)
- Day-by-day status cards
- Weekly percentage gauge
- Cumulative stats comparison
- Email report button

---

### 5.6 ChildAttendanceCalendar.tsx — Parent Multi-Child View

**File:** `components/dashboard/StudentAttendance/ChildAttendanceCalendar.tsx`

**Purpose:** Calendar view for parents with multiple children.

**Data Received:**
- Array of children with their attendance data

**User Flow:**
1. Parent selects child from dropdown
2. Calendar shows selected child's attendance
3. Quick switch between children
4. Compare siblings' attendance

**Components Rendered:**
- Child selector dropdown
- Attendance calendar
- Per-child stats
- Sibling comparison view

---

### 5.7 attendance-summary-card.tsx — Parent Dashboard

**File:** `components/dashboard/parent/attendance-summary-card.tsx`

**Purpose:** Summary card on parent dashboard showing attendance overview.

**Data Received:**
```typescript
{
  monthlyStats: {
    totalDays: number,
    presentDays: number,
    absentDays: number,
    lateDays: number,
    percentage: number,
  },
}
```

**User Flow:**
1. Parent logs in to dashboard
2. Sees attendance summary card
3. Click to view detailed calendar
4. Quick view of monthly percentage

**Components Rendered:**
- Percentage gauge/ring
- Present/Absent/Late counts
- Link to full calendar
- Trend indicator (up/down)

---

### 5.8 AdminDashboardCards.tsx — Admin Overview

**File:** `components/dashboard/admin/AdminDashboardCards.tsx`

**Purpose:** Shows attendance completion stats across all sections.

**Data Received:**
```typescript
{
  stats: {
    totalSections: number,
    completedSections: number,
    pendingSections: number,
    totalStudents: number,
    totalPresent: number,
    completionPercentage: number,
    attendancePercentage: number,
  },
}
```

**User Flow:**
1. Admin views dashboard
2. Sees attendance completion cards
3. Click to view section-wise details
4. Monitor which sections haven't marked attendance

**Components Rendered:**
- Completion percentage card
- Sections completed vs pending
- Total students present
- Link to detailed analytics

---

### 5.9 TeacherDashboardStatsCard.tsx — Teacher Overview

**File:** `components/dashboard/teacher/TeacherDashboardStatsCard.tsx`

**Purpose:** Shows today's and monthly attendance stats for teacher's sections.

**Data Received:**
```typescript
{
  todayAttendance: {
    total: number,
    present: number,
    late: number,
    absent: number,
    percentage: number,
    markedToday: number,
  },
  monthAttendance: {
    percentage: number,
    totalRecords: number,
  },
}
```

**User Flow:**
1. Teacher logs in
2. Sees today's attendance stats
3. Sees monthly attendance percentage
4. Quick link to mark attendance if not completed

**Components Rendered:**
- Today's attendance card
- Monthly percentage card
- "Mark Attendance" CTA button
- Section-wise breakdown

---

### 5.10 StudentDashboardStatsCards.tsx — Student Overview

**File:** `components/dashboard/student/StudentDashboardStatsCards.tsx`

**Purpose:** Shows attendance rate and streak for student dashboard.

**Data Received:**
```typescript
{
  attendanceRate: number,
  attendancePresent: number,
  attendanceLate: number,
  attendanceTotal: number,
  currentStreak: number,
}
```

**User Flow:**
1. Student logs in
2. Sees attendance rate percentage
3. Sees current attendance streak
4. Click to view detailed calendar

**Components Rendered:**
- Attendance rate gauge
- Present/Late/Total counts
- Current streak badge (fire icon)
- Link to full attendance page

---

## 6. Role Based Access

### Who Can Mark Attendance

| Role | Can Mark | For Whom | Notes |
|------|----------|----------|-------|
| **Admin** | ✅ Yes | Any section | Can override and edit any record |
| **Teacher** | ✅ Yes | Assigned sections only | Based on teaching assignments |
| **Student** | ❌ No | N/A | Can only view own attendance |
| **Parent** | ❌ No | N/A | Can only view children's attendance |

### Who Can View Attendance

| Role | Can View | Scope |
|------|----------|-------|
| **Admin** | ✅ All attendance | Organization-wide |
| **Teacher** | ✅ Section attendance | Assigned sections only |
| **Student** | ✅ Own attendance | Personal records only |
| **Parent** | ✅ Children's attendance | Linked children only |

### Who Can Export Reports

| Role | PDF Export | Excel Export | Email Reports |
|------|-----------|--------------|---------------|
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Teacher** | ✅ Yes (own sections) | ❌ No | ❌ No |
| **Student** | ✅ Yes (own records) | ❌ No | ❌ No |
| **Parent** | ✅ Yes (children's records) | ❌ No | ✅ Weekly auto-email |

---

## 7. Email Reports — WeeklyAttendanceReportMail

**File:** `components/templates/email-templates/WeeklyAttendanceReportMail.tsx`

**Purpose:** Sends weekly attendance summary email to parents.

**Trigger:** Scheduled cron job every Friday at 6:00 PM IST

**Email Flow:**
1. Cron job triggers `getWeeklyAttendanceReport()` for each student
2. Fetch weekly attendance data
3. Generate HTML email using `WeeklyAttendanceReportEmailTemplate`
4. Send via Resend/SendGrid
5. Log delivery status

**Email Content:**
```tsx
<WeeklyAttendanceReportEmailTemplate data={weeklyReportData} />
```

**Email Sections:**
1. Header with school logo
2. Student name and class/section
3. Week range (Monday - Friday)
4. Daily attendance grid (Mon-Fri with status badges)
5. Weekly percentage
6. Cumulative yearly stats
7. School contact information
8. Footer with unsubscribe link

**Data Passed:**
```typescript
{
  student: Student,
  attendanceRecords: WeeklyAttendanceRecord[],
  weekRange: { startDate, endDate },
  organization: Organization,
  cumulativeStats: {
    totalDaysPresent: number,
    totalPossibleDays: number,
    attendancePercentage: number,
    totalLateArrivals: number,
  },
}
```

---

## 8. PDF Export — attendance-pdf-report.tsx

**File:** `lib/pdf-generator/attendance-pdf-report.tsx`

**Purpose:** Generates professional PDF attendance reports.

**Library:** `@react-pdf/renderer`

**Input Props:**
```typescript
{
  records: AttendanceExportRecord[],
  organization: Organization | null,
  title?: string,
  filters?: AttendanceExportFilters,
}
```

**PDF Structure:**
1. **Header Section**
   - Organization name and logo
   - Report title
   - Generated date and time
   - Filter info (grade/section if applied)

2. **Summary Stats Container**
   - Total students
   - Present count
   - Absent count
   - Late count
   - Attendance percentage

3. **Data Table**
   - Columns: #, Student Name, Roll No., Class, Date, Status, Remarks
   - Alternating row colors
   - Status color coding (Green=Present, Red=Absent, Yellow=Late)
   - Professional borders and spacing

4. **Footer**
   - Organization name
   - Page numbers
   - Generation timestamp

**Professional Styling:**
```typescript
const colors = {
  primary: '#111827',      // Dark gray
  primaryDark: '#030712',  // Almost black
  accent: '#1D4ED8',       // Blue
  success: '#15803D',      // Green for Present
  danger: '#B91C1C',       // Red for Absent
  warning: '#A16207',      // Yellow for Late
};
```

**Export Flow:**
1. User clicks "Export PDF" button
2. Client fetches attendance data with filters
3. Calls `AttendancePDFReport` component
4. Generates PDF blob
5. Downloads to user's device

---

## 9. Known Fixed Bugs

### Bug #1: Double-Counting of LATE Students

**Issue:** LATE students were being counted twice in some calculations (once as PRESENT, once as LATE).

**Location:** Multiple files including `get-student-dashboard-stats.ts`, `get-teacher-dashboard-stats.ts`

**Before (Incorrect):**
```typescript
const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length;

// Wrong: Adding late to present for percentage
const attendanceRate = ((presentCount + lateCount + lateCount) / total) * 100;
```

**After (Fixed):**
```typescript
const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length;

// Correct: LATE counted once for percentage
const attendanceRate = ((presentCount + lateCount) / total) * 100;
```

**Files Updated:**
- `lib/data/attendance/my-attendance.ts`
- `lib/data/student/get-student-dashboard-stats.ts`
- `lib/data/teacher/get-teacher-dashboard-stats.ts`
- `lib/data/reports/get-reports-data.ts`

---

### Bug #2: Dashboard Stats Split Incorrectly

**Issue:** Teacher dashboard showed different percentages for "Today" vs "Month" due to inconsistent counting logic.

**Location:** `get-teacher-dashboard-stats.ts`

**Before (Inconsistent):**
```typescript
// Today: Used only PRESENT
const todayAttendancePercentage = (todayPresent / totalStudents) * 100;

// Month: Used PRESENT + LATE
const monthAttendancePercentage = (monthPresent / monthTotal) * 100;
```

**After (Consistent):**
```typescript
// Both use PRESENT + LATE
const todayAttendancePercentage = ((todayPresent + todayLate) / totalStudents) * 100;
const monthAttendancePercentage = (monthPresent / monthTotal) * 100;
```

---

### Bug #3: Monthly Attendance Percentage Calculation

**Issue:** `getMonthlyAttendance.ts` was calculating percentage as `presentDays / totalDays` instead of `(presentDays + lateDays) / totalDays`.

**Location:** `lib/data/parent/attendance-monitor/getMonthlyAttendance.ts`

**Before:**
```typescript
const percentage = Math.round((presentDays / totalDays) * 100);
```

**After:**
```typescript
const percentage = Math.round(((presentDays + lateDays) / totalDays) * 100);
```

---

### Bug #4: Attendance Streak Not Counting LATE

**Issue:** Attendance streak was broken by LATE status, but LATE should continue the streak.

**Location:** `lib/data/attendance/my-attendance.ts`

**Before:**
```typescript
if (r.status === 'PRESENT') currentStreak++;
else break;
```

**After:**
```typescript
if (r.status === 'PRESENT' || r.status === 'LATE') currentStreak++;
else break;
```

---

## 10. Additional Files

### FilterAttendance.ts
**File:** `lib/data/attendance/FilterAttendance.ts`
- Provides filtering utilities for attendance data
- Functions: `filterByDateRange()`, `filterByGrade()`, `filterBySection()`, `filterByStatus()`

### attendance-export.tsx
**File:** `components/dashboard/StudentAttendance/attendance-export.tsx`
- Export interface and types for attendance data
- Used for PDF/Excel export formatting

### attendance-analytics.ts
**File:** `types/attendance-analytics.ts`
- Type definitions for attendance analytics
- Interfaces: `AttendanceStats`, `StudentAnalytics`, `SectionAttendanceDetails`

### attendance-export.ts
**File:** `types/attendance-export.ts`
- Type definitions for export functionality
- Interfaces: `AttendanceExportRecord`, `AttendanceExportFilters`, `Organization`

---

## 11. API Routes

### GET /api/attendance
- Fetch attendance records with filters
- Query params: `studentId`, `gradeId`, `sectionId`, `startDate`, `endDate`

### POST /api/attendance/mark
- Mark attendance for a section
- Body: `{ sectionId, date, records: [{ studentId, status, note }] }`

### GET /api/attendance/report
- Generate attendance report
- Query params: `format` (pdf/excel), `filters`

### GET /api/attendance/stats
- Get attendance statistics
- Query params: `type` (today/week/month/year)

---

## 12. Cron Jobs

### Weekly Attendance Report Email
**Schedule:** Every Friday at 6:00 PM IST  
**Function:** `sendWeeklyAttendanceEmails()`  
**Location:** `app/api/inngest/functions.ts`

**Process:**
1. Fetch all active students
2. Get weekly attendance for each
3. Generate email HTML
4. Send to parent email addresses
5. Log delivery status

---

## 13. Best Practices

### Date Handling
- Always use `toISTDate()` for date comparisons
- Store dates in UTC, display in IST
- Use `formatISO()` for API responses

### Performance
- Paginate large datasets (50 records per page)
- Use Prisma `select` to fetch only needed fields
- Cache dashboard stats for 5 minutes

### Security
- Verify user ownership before fetching child data
- Use `getCurrentUserId()` and `getOrganizationId()` in all server actions
- Validate all inputs with Zod schemas

### Notifications
- Send notifications only for ABSENT and LATE status
- Use `notify.attendance.absent()` and `notify.attendance.late()`
- Include student name, date, grade, section in notification variables

---

## 14. Future Enhancements

### Planned Features
- [ ] Biometric integration for attendance marking
- [ ] Geofencing for automatic attendance
- [ ] AI-powered absence prediction
- [ ] Parent approval for late arrivals
- [ ] Bulk attendance import via Excel
- [ ] Attendance reminders to teachers
- [ ] Section-wise attendance competitions
- [ ] Student self-attendance (for higher education)

### Technical Improvements
- [ ] Redis caching for dashboard stats
- [ ] Real-time attendance updates via WebSocket
- [ ] Attendance anomaly detection
- [ ] Automated follow-up emails for chronic absentees
- [ ] Integration with transport system for bus tracking

---

**End of Documentation**

**Last Updated:** March 29, 2026  
**Maintained By:** Development Team  
**Version:** 2.0
