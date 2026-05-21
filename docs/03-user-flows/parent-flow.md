# Parent Flow - Shiksha Cloud (School Management System)

## Login & Access

1. **Sign In** → Go to `/sign-in`, authenticate via Clerk
2. **Select Organization** → Choose your child's school/institution
3. **Middleware Validation** → `org:parent` mapped to `parent` role
4. **Child Selection** → System loads children via `SelectedChildProvider` context
5. **Dashboard Home** → `/dashboard` renders `ParentDashboard` component

## Parent Dashboard

Lands on `/dashboard` showing:
- **Child Switcher**: Dropdown to switch between multiple children (if applicable)
- **Children Overview Card**: All children listed with today's attendance status (colored dots), grade/section, pending fees
- **Attendance Summary Card**: Selected child's attendance %, progress bar, present/late/absent breakdown, last 7 days as P/L/A tiles
- **Fee Summary Card**: Total fees, paid amount, pending balance, overdue badge, last payment amount
- **Transport Map**: Bus route visualization with stops and live tracking (static/mock data currently)
- **Today's Timeline**: Daily event timeline (transport, attendance, exams, fees, notices)
- **Notices Widget**: Filterable list of notices targeted at parents
- **Quick Actions Bar**: Attendance, Pay Fees, Notices, Settings

## Child Selection System

- **Single Child**: Displays static badge with avatar, name, grade, and section
- **Multiple Children**: Dropdown menu showing all children with:
  - Avatar and full name
  - Grade and section
  - Relationship (e.g., Father, Mother, Guardian)
  - Primary parent indicator
- **Cookie-Based**: Selected child stored in `selectedChildId` cookie (30-day expiry)
- **Ownership Guard**: Server action validates `ParentStudent` record before allowing selection
- **Context Provider**: `SelectedChildProvider` uses `useOptimistic` for instant UI updates

## Core Features & Workflows

| Feature | Route | Key Actions |
|---------|-------|-------------|
| **My Children** | `/dashboard/my-children` | Grid view of all children with attendance rate, fee status, DOB, gender, roll number |
| **Child Attendance** | `/dashboard/child-attendance` | Full calendar view of selected child's attendance, monthly/annual stats, streaks |
| **Fees (Parent)** | `/dashboard/fees/parent` | Fee stats, pending fees table, payment history, online payment |
| **Pay Fees** | Via `PayFeeButton` | Opens dialog: fee category, base amount, 2.5% convenience charge, PhonePe payment |
| **Exams & Results** | `/dashboard/exams` | View exams and results for all children |
| **Exam Sessions** | `/dashboard/exam-sessions` | Active exam sessions |
| **Bus Transport** | `/dashboard/transport` | Bus route map with stops and tracking (static currently) |
| **Notice Board** | `/dashboard/notices` | View published notices targeted at parents |
| **Anonymous Complaints** | `/dashboard/anonymous-complaints` | Submit anonymous complaints, track status |
| **Create Complaint** | `/dashboard/anonymous-complaints/create` | File complaint with category and details |
| **Track Complaint** | `/dashboard/anonymous-complaints/track` | Track via unique tracking ID |
| **Student Profile** | `/dashboard/students/[id]` | View individual child's detailed profile |
| **Org Gallery** | `/dashboard/organization-gallery` | View school photos and media |
| **Settings** | `/dashboard/settings` | Update profile, notification preferences (ComingSoon) |

## Parent Permissions (RBAC)

**Can Access**:
- `/dashboard` (home)
- `/dashboard/my-children` — View all children
- `/dashboard/child-attendance` — Selected child's attendance calendar
- `/dashboard/fees/parent` — Parent fee dashboard
- `/dashboard/fees` — General fee status page
- `/dashboard/exams` — View exams and results for all children
- `/dashboard/exams/[id]` — Exam details
- `/dashboard/exam-sessions(*)` — All exam session routes
- `/dashboard/transport` — Bus transport map
- `/dashboard/notices` — View published notices
- `/dashboard/notices/[id]` — Notice details
- `/dashboard/anonymous-complaints` — Submit and track complaints
- `/dashboard/anonymous-complaints/create` — Create complaint
- `/dashboard/anonymous-complaints/track` — Track complaint
- `/dashboard/anonymous-complaints/track(*)` — Track specific complaint
- `/dashboard/students/[id]` — View individual child's profile
- `/dashboard/assignments` — View assignments
- `/dashboard/settings` — Settings
- `/dashboard/organization-gallery` — View org media

**Cannot Access**:
- `/dashboard/onboarding` — Admin only
- `/dashboard/agents(*)` — Admin only
- `/dashboard/grades(*)` — Admin/Teacher only
- `/dashboard/subjects`, `/dashboard/teaching-assignments`, `/dashboard/holidays` — Admin only
- `/dashboard/students/create`, `/dashboard/students/[id]/edit`, `/dashboard/students` (list) — Admin/Teacher only
- `/dashboard/teachers` — Admin only
- `/dashboard/attendance/mark`, `/dashboard/attendance/analytics`, `/dashboard/attendance` — Admin/Teacher only
- `/dashboard/my-attendance` — Student only
- `/dashboard/documents`, `/dashboard/documents/verification` — Student/Admin/Teacher only
- `/dashboard/fees/admin`, `/dashboard/fees/student`, `/dashboard/fees/teacher` — Other roles
- `/dashboard/exams/create`, `/dashboard/exams/bulk` — Admin/Teacher only
- `/dashboard/leads(*)` — Admin/Teacher only
- `/dashboard/notices/create` — Admin/Teacher only
- `/dashboard/leaves`, `/dashboard/leaves/manage` — Parent excluded from leaves
- `/dashboard/anonymous-complaints/manage` — Admin/Teacher only
- `/dashboard/reports` — Admin/Teacher only
- `/dashboard/certificate-generator` — Admin only

## Parent Menu Structure

| Group | Menu Item | Route |
|-------|-----------|-------|
| — | Dashboard | `/dashboard` |
| **Monitoring** | My Children | `/dashboard/my-children` |
| **Academics** | Attendance | `/dashboard/child-attendance` |
| | Exams / Results | `/dashboard/exams` |
| | Bus Transport | `/dashboard/transport` |
| **Finance** | Fees | `/dashboard/fees/parent` |
| **Communication** | Notice Board | `/dashboard/notices` |
| **Settings** | Settings | `/dashboard/settings` |

## Parent Dashboard Components

| Component | File | Purpose |
|-----------|------|---------|
| `ParentDashboard` | `parent-dashboard.tsx` | Main dashboard layout |
| `ChildSwitcher` | `child-switcher.tsx` | Dropdown to switch between children |
| `ChildrenOverviewCard` | `children-overview-card.tsx` | Lists all children with attendance status, grade, pending fees |
| `AttendanceSummaryCard` | `attendance-summary-card.tsx` | Selected child's attendance % with progress bar, 7-day tiles |
| `FeesSummaryCard` | `fees-summary-card.tsx` | Fee totals, paid/pending, overdue badge, last payment |
| `ChildrenStats` | `parent-children-stats.tsx` | 4 stat cards: Total Children, Avg Attendance, Grade Levels, Fees Pending |
| `ParentFeeStatsCards` | `parent-fee-stats-cards.tsx` | Fee/attendance stat cards with family totals |
| `ChildCard` | `child-card.tsx` | Individual child card with attendance rate, fee status, actions |
| `NoticesWidget` | `notices-widget.tsx` | Filterable notices with type/priority configs |
| `TodayTimeline` | `today-timeline.tsx` | Daily event timeline |
| `TransportMap` | `transport-map.tsx` | Bus route map with stops (1052 lines, mostly static mock data) |

## Daily Parent Workflow

```
Sign In → Select Org → Dashboard
                           ↓
Morning: Check Child Attendance → Review Today's Schedule
                           ↓
Monitor: View All Children → Switch Between Children → Check Attendance %
                           ↓
Finance: Review Pending Fees → Pay Online (PhonePe) → Download Receipt
                           ↓
Communication: Read Notices → Check Exam Results → Track Complaints (if any) → Logout
```

## Key Parent Features

- **Multi-Child Support**: Monitor all children from single dashboard
- **Child Switching**: Cookie-based selection with ownership validation
- **Attendance Monitoring**: Full calendar view with monthly/annual statistics and streaks
- **Attendance Rate Color Coding**:
  - >= 85% = "On Track" (teal)
  - >= 75% = "Needs Attention" (amber)
  - < 75% = "Low Attendance" (orange)
- **Fee Payment**: Online payment via PhonePe with 2.5% convenience charge
- **Family Fee Summary**: Aggregate fees across all children
- **Payment History**: Complete transaction history for selected child
- **Bus Transport Tracking**: Route map with stops (live tracking coming soon)
- **Notice Filtering**: Only notices targeted at `PARENT` role are shown
- **Anonymous Complaints**: Safe reporting with status tracking
- **Ownership Guards**: Every data query verifies `ParentStudent` relationship
- **IST-Aware Dates**: All attendance queries use `toISTDate()` for accuracy
- **Primary Parent Indicator**: `isPrimary` flag in `ParentStudent` join table

## Data Model

- **Parent**: `id`, `userId`, `firstName`, `lastName`, `email`, `phoneNumber`, `whatsAppNumber`
- **ParentStudent Join Table**: `id`, `relationship`, `studentId`, `parentId`, `isPrimary`
- **Relationships**: Parent has many students via `ParentStudent`, belongs to `User`

## Future Roadmap (Commented in Code)

- Phase: What's live — Fees + Attendance + Exams + Notices ✅
- Full dashboard + Transport — Live bus tracking, ETA
- Timetable, LMS, Biometric, AI Reports, HallTicket
