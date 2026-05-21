# Student Flow - Shiksha Cloud (School Management System)

## Login & Access

1. **Sign In** → Go to `/sign-in`, authenticate via Clerk
2. **Select Organization** → Choose your school/institution (if member of multiple)
3. **Middleware Validation** → `org:student` mapped to `student` role
4. **Dashboard Home** → `/dashboard` renders `StudentDashboard` component

## Student Dashboard

Lands on `/dashboard` showing:
- **Stats Cards**: Attendance percentage, current semester GPA, fee status, pending assignments
- **Performance Radar**: Subject-wise performance chart across exam sessions
- **Fees Quick Card**: Total fees, paid amount, pending balance, overdue status
- **Notices Widget**: Latest notices targeted at students
- **Quick Actions**: Pay Fees, Download Receipt, Submit Complaint

## Core Features & Workflows

| Feature | Route | Key Actions |
|---------|-------|-------------|
| **Assignments** | `/dashboard/assignments` | View assigned homework, submit work, track deadlines |
| **My Attendance** | `/dashboard/my-attendance` | View personal attendance history, calendar view, monthly stats |
| **Exams & Results** | `/dashboard/exams` | View exam schedule, check results, download report cards |
| **Exam Sessions** | `/dashboard/exam-sessions` | View active exam sessions |
| **Fees** | `/dashboard/fees/student` | View fee breakdown, pay online, download receipts |
| **My Documents** | `/dashboard/documents` | Upload required documents (AADHAAR, certificates, etc.) |
| **Leaves** | `/dashboard/leaves` | Apply for leave, view leave history |
| **Notice Board** | `/dashboard/notices` | View published notices targeted at students |
| **Anonymous Complaints** | `/dashboard/anonymous-complaints` | Submit anonymous complaints, track status |
| **Create Complaint** | `/dashboard/anonymous-complaints/create` | File anonymous complaint with category and details |
| **Track Complaint** | `/dashboard/anonymous-complaints/track` | Track complaint status via tracking ID |
| **Integrations** | `/dashboard/integrations` | Manage connected apps/integrations |
| **Settings** | `/dashboard/settings` | Edit profile, update contact info, notification preferences |
| **Org Gallery** | `/dashboard/organization-gallery` | View school photos and media |

## Student Permissions (RBAC)

**Can Access**:
- `/dashboard` (home)
- `/dashboard/assignments` — View assignments
- `/dashboard/my-attendance` — Own attendance only
- `/dashboard/exams` — View exams and results
- `/dashboard/exams/[id]` — Exam details
- `/dashboard/exam-sessions(*)` — All exam session routes
- `/dashboard/fees/student` — Student fee dashboard
- `/dashboard/fees` — General fee status page
- `/dashboard/documents` — Upload and manage own documents
- `/dashboard/leaves` — Apply for leave
- `/dashboard/notices` — View published notices
- `/dashboard/notices/[id]` — Notice details
- `/dashboard/anonymous-complaints` — Submit and track complaints
- `/dashboard/anonymous-complaints/create` — Create complaint
- `/dashboard/anonymous-complaints/track` — Track complaint
- `/dashboard/anonymous-complaints/track(*)` — Track specific complaint
- `/dashboard/integrations` — Manage integrations
- `/dashboard/settings` — Edit profile
- `/dashboard/organization-gallery` — View org media

**Cannot Access**:
- `/dashboard/onboarding` — Admin only
- `/dashboard/agents(*)` — Admin only
- `/dashboard/grades(*)` — Admin/Teacher only
- `/dashboard/subjects` — Admin only
- `/dashboard/teaching-assignments` — Admin only
- `/dashboard/holidays` — Admin/Teacher only
- `/dashboard/students/create`, `/dashboard/students/[id]/edit`, `/dashboard/students` — Admin/Teacher only
- `/dashboard/teachers` — Admin only
- `/dashboard/attendance/mark`, `/dashboard/attendance/analytics`, `/dashboard/attendance` — Admin/Teacher only
- `/dashboard/documents/verification` — Admin/Teacher only
- `/dashboard/my-children`, `/dashboard/child-attendance` — Parent only
- `/dashboard/fees/admin`, `/dashboard/fees/parent`, `/dashboard/fees/teacher` — Other roles
- `/dashboard/exams/create`, `/dashboard/exams/bulk` — Admin/Teacher only
- `/dashboard/leads(*)` — Admin/Teacher only
- `/dashboard/notices/create` — Admin/Teacher only
- `/dashboard/leaves/manage` — Admin/Teacher only
- `/dashboard/anonymous-complaints/manage` — Admin/Teacher only
- `/dashboard/reports` — Admin/Teacher only
- `/dashboard/certificate-generator` — Admin only

## Student Menu Structure

| Group | Menu Item | Route |
|-------|-----------|-------|
| — | Student Portal | `/dashboard` |
| **Academic** | Assignments | `/dashboard/assignments` |
| | Attendance | `/dashboard/my-attendance` |
| | Exams | `/dashboard/exams` |
| | Fees | `/dashboard/fees/student` |
| | My Documents | `/dashboard/documents` |
| **Communication** | Leaves | `/dashboard/leaves` |
| | Notice Board | `/dashboard/notices` |
| | Anonymous Complaints | `/dashboard/anonymous-complaints` |
| **Settings** | Settings | `/dashboard/settings` |

## Daily Student Workflow

```
Sign In → Select Org → Dashboard
                           ↓
Check: Notices → Assignments → Today's Schedule
                           ↓
Academic: View Attendance → Check Exam Results → Submit Assignments
                           ↓
Admin: Pay Fees → Download Receipt → Upload Documents
                           ↓
Communication: Apply for Leave → Submit Complaint (if needed) → Logout
```

## Key Student Features

- **Personal Attendance**: View only own attendance with calendar visualization
- **Subject Performance**: Radar chart showing subject-wise performance across exams
- **Online Fee Payment**: Pay fees online with convenience charge calculation
- **Receipt Downloads**: Download payment receipts via email or direct download
- **Document Upload**: Upload required documents for verification (AADHAAR, PAN, certificates)
- **Exam Schedule**: View upcoming exam dates and hall tickets
- **Result Tracking**: Check exam results with detailed mark breakdown
- **Assignment Tracking**: View and submit homework/assignments
- **Leave Application**: Apply for leave with reason, track approval status
- **Anonymous Complaints**: Safe reporting mechanism with status tracking via unique ID
- **Profile Management**: Edit personal information, update contact details
- **Notices Feed**: Role-targeted notices relevant to students only
