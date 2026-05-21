# Teacher Flow - Shiksha Cloud (School Management System)

## Login & Access

1. **Sign In** → Go to `/sign-in`, authenticate via Clerk
2. **Select Organization** → Choose your school/institution
3. **Middleware Validation** → `org:teacher` mapped to `teacher` role
4. **Dashboard Home** → `/dashboard` renders `TeacherDashboard` component

## Teacher Dashboard

Lands on `/dashboard` showing:
- **Header**: "Teacher Dashboard" with quick actions (Take Attendance, My Students)
- **Stats Cards**: Total students, classes assigned, attendance rate, pending tasks
- **Today's Class Schedule**: Current day's timetable
- **Recent Activity Feed**: Latest actions and updates
- **Quick Actions**: Take Attendance, View Students

## Core Features & Workflows

| Feature | Route | Key Actions |
|---------|-------|-------------|
| **Take Attendance** | `/dashboard/attendance/mark` | Mark section-wise attendance with AI suggestions (late/absent) |
| **Attendance Analytics** | `/dashboard/attendance/analytics` | View attendance history, filter by date range, grade/section |
| **Class Management** | `/dashboard/grades` | View assigned grades/sections, subjects |
| **Student Management** | `/dashboard/students` | View, filter, search students (create/edit if permitted) |
| **Fees Tracking** | `/dashboard/fees/teacher` | View student fee status, pending payments |
| **Fee Assignment** | `/dashboard/fees/admin/assign` | Assign fees to students (shared with admin) |
| **Fee Categories** | `/dashboard/fees/admin/fee-categories` | View/edit fee categories (shared with admin) |
| **Exams** | `/dashboard/exams` | View exam sessions, enter results, generate report cards |
| **Create Exams** | `/dashboard/exams/create` | Create new exams and exam sessions |
| **Bulk Exams** | `/dashboard/exams/bulk` | Bulk exam creation |
| **Notices** | `/dashboard/notices` | View all notices, create new notices |
| **Create Notices** | `/dashboard/notices/create` | Draft and publish notices (email/SMS/WhatsApp) |
| **Complaints** | `/dashboard/anonymous-complaints/manage` | Review, investigate, update complaint status |
| **Leaves** | `/dashboard/leaves` | Apply for leave, view own leave history |
| **Document Verification** | `/dashboard/documents/verification` | Review and verify/reject student documents |
| **Holidays** | `/dashboard/holidays` | View academic calendar and holidays |
| **Leads (CRM)** | `/dashboard/leads` | Track prospective student inquiries |
| **Reports** | `/dashboard/reports` | Generate attendance, performance reports |
| **Settings** | `/dashboard/settings` | Update profile, notification preferences |

## Teacher Permissions (RBAC)

**Can Access**:
- `/dashboard` (home)
- `/dashboard/attendance/mark` — Mark attendance
- `/dashboard/attendance/analytics` — View analytics
- `/dashboard/attendance` — Attendance history
- `/dashboard/grades(*)` — View/manage grades and sections
- `/dashboard/students/create` — Add new students
- `/dashboard/students/[id]/edit` — Edit student records
- `/dashboard/students` — View student list
- `/dashboard/fees/teacher` — Teacher fee dashboard
- `/dashboard/fees/admin/assign` — Assign fees
- `/dashboard/fees/admin/fee-categories` — Manage fee categories
- `/dashboard/exams/create` — Create exams
- `/dashboard/exams/bulk` — Bulk exam operations
- `/dashboard/exams` — View exam sessions
- `/dashboard/exams/[id]` — Exam details
- `/dashboard/exam-sessions(*)` — All exam session routes
- `/dashboard/notices` — View notices
- `/dashboard/notices/[id]` — Notice details
- `/dashboard/notices/create` — Create notices
- `/dashboard/leads(*)` — Lead management
- `/dashboard/anonymous-complaints/manage` — Manage complaints
- `/dashboard/anonymous-complaints(*)` — All complaint routes
- `/dashboard/leaves` — Apply for leave
- `/dashboard/leaves/manage` — Manage leave requests
- `/dashboard/holidays` — View holidays
- `/dashboard/documents/verification` — Verify documents
- `/dashboard/reports` — Generate reports
- `/dashboard/assignments` — View assignments
- `/dashboard/settings` — Update profile
- `/dashboard/organization-gallery` — View org media

**Cannot Access**:
- `/dashboard/onboarding` — Admin only
- `/dashboard/agents(*)` — Admin only
- `/dashboard/teachers` — Admin only
- `/dashboard/subjects` — Admin only
- `/dashboard/teaching-assignments` — Admin only
- `/dashboard/fees/admin` — Full fee admin
- `/dashboard/my-attendance` — Student only
- `/dashboard/my-children` — Parent only
- `/dashboard/certificate-generator` — Admin only

## Teacher Menu Structure

| Group | Menu Item | Route |
|-------|-----------|-------|
| — | Dashboard | `/dashboard` |
| **Management** | Take Attendance | `/dashboard/attendance/mark` |
| | Class Management | `/dashboard/grades` |
| | Fees Management | `/dashboard/fees/teacher` |
| | Lead Management | `/dashboard/leads` |
| | Students Management | `/dashboard/students` |
| | Exam Management | `/dashboard/exams` |
| | Holidays Management | `/dashboard/holidays` |
| | Complaints Management | `/dashboard/anonymous-complaints/manage` |
| | Documents Verification | `/dashboard/documents/verification` |
| **Personal** | Leaves | `/dashboard/leaves` |
| | Notice Board | `/dashboard/notices` |
| **Settings** | Settings | `/dashboard/settings` |

## Daily Teacher Workflow

```
Sign In → Select Org → Dashboard
                           ↓
Morning: Take Attendance → Review Today's Schedule
                           ↓
During Day: Teach Classes → Mark Period-wise Attendance
                           ↓
Admin Tasks: Enter Exam Results → Create Notices → Review Complaints
                           ↓
End of Day: Apply for Leave (if needed) → Check Reports → Logout
```

## Key Teacher Features

- **One-Click Attendance**: AI suggests late/absent students based on patterns
- **Exam Management**: Create exams, enter results, generate hall tickets and report cards
- **Notice Creation**: Draft, submit for review, publish to targeted audiences
- **Complaint Investigation**: Review anonymous complaints, update status, add notes
- **Leave Management**: Apply for leave, track approval status
- **Document Verification**: Review student-uploaded documents (AADHAAR, certificates, etc.)
- **Lead Tracking**: Track prospective student inquiries from website/ads
- **Multi-Class Support**: View and manage multiple assigned classes/sections
- **Role-Based Terminology**: "Grade" vs "Class" adapts based on organization type
