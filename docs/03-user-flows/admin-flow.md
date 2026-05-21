# Admin Flow - Shiksha Cloud (School Management System)

## Setup & First-Time Login

1. **Sign In** → Go to `/sign-in`, authenticate via Clerk
2. **Select Organization** → Choose or create your school/institution
3. **Onboarding Wizard** (if first time):
   - Configure organization details
   - Create academic year
   - Add grades/classes (e.g., "Grade 10", "Grade 11")
   - Add sections (e.g., "A", "B", "SCIENCE")
   - Enroll students
   - Link parents to students
   - Add teachers
   - Create subjects
   - Set up fee categories
   - Assign teachers to classes
   - Assign fees to students

## Daily Admin Dashboard

After login, you land on `/dashboard` showing:
- **Stats Cards**: Students (total, present/late today), Teachers, Revenue (collected/pending), Complaints
- **Monthly Fee Collection Chart**
- **Recent Activity Feed**
- **Quick Actions**: Add Student, Create Notice, Take Attendance, Manage Fees

## Core Daily Workflows

| Feature | Route | Key Actions |
|---------|-------|-------------|
| **Student Management** | `/dashboard/students` | Add, edit, filter, search students |
| **Attendance** | `/dashboard/attendance/mark` | Mark section-wise attendance with AI suggestions |
| **Attendance Analytics** | `/dashboard/attendance/analytics` | View history, filter by date range, export CSV/PDF |
| **Fees Management** | `/dashboard/fees/admin` | Assign fees, track payments, send reminders, download receipts |
| **Fee Categories** | `/dashboard/fees/admin/fee-categories` | Create/edit fee types (tuition, exam, lab, etc.) |
| **Notices** | `/dashboard/notices` | Create, approve, publish notices (email/SMS/WhatsApp) |
| **Complaints** | `/dashboard/anonymous-complaints/manage` | Review, investigate, update status |
| **Exams** | `/dashboard/exams` | Create sessions, publish results, generate report cards |
| **Teachers** | `/dashboard/teachers` | Add, manage, assign to classes |
| **Grades/Sections** | `/dashboard/grades` | Create, edit, delete grades and sections |
| **Holidays** | `/dashboard/holidays` | Add single/bulk import holidays |
| **Leaves** | `/dashboard/leaves/manage` | Approve/reject leave requests |
| **Documents** | `/dashboard/documents/verification` | Verify student-uploaded documents |
| **Leads (CRM)** | `/dashboard/leads` | Track prospective students |
| **AI Agents** | `/dashboard/agents` | Run FeeSense AI for automated fee collection |
| **Reports** | `/dashboard/reports` | Generate various reports |
| **Settings** | `/dashboard/settings` | Org config, notifications, billing, academic years |

## Key Features

- **Role-Based Access**: Admin has full access; teachers/students/parents have restricted views
- **Multi-Tenant**: Switch organizations via sidebar
- **Academic Year Switching**: Toggle between years via navbar
- **Notifications**: Multi-channel (email, SMS, WhatsApp, push)
- **AI-Powered**: FeeSense agent analyzes payment patterns and sends automated reminders
- **Export Options**: CSV/PDF downloads for attendance, fees, reports

## Complete Admin Journey Summary

```
Sign In → Select Org → Onboarding (if new) → Dashboard
                                              ↓
Daily: Attendance → Fees → Notices → Students → Teachers → Exams → Complaints
                                              ↓
Settings → Reports → Switch Org/Year → Logout
```
