# Shiksha Cloud - Features

## Completed Modules

### Digital ID Card Module ✅
**Status**: Production Ready (v1.0.0)  
**Date**: 2026-05-21  
**Docs**: `docs/02-modules/id-card/`

- **Card Generation**: Bulk + individual generation for students and teachers
- **PDF Export**: On-demand PDF generation matching HTML preview exactly
- **QR Verification**: Public verification page at `/verify/id-card/[cardNumber]`
- **Dashboard**: Card/List toggle, search, filter, sort, year selection
- **Security**: Admin-only actions, organization scoping, server actions
- **Design**: Role-based colors, organization logo, passport-size photos
- **Performance**: Batch processing, deduplication, version tracking

### Attendance Monitoring (Parent) ✅
- Calendar view with monthly attendance
- Recent attendance history
- Proper error handling when no data found

### My Children (Parent) ✅
- Proper error handling: "No children found" with option to create
- Child selection and management

### Fee Category Management (Admin) ✅
- Edit page completed (modal-based for better UX)
- Delete with foreign key constraint validation

---

## In Progress / Pending Modules

### Attendance Table
- [ ] Filter by Date / DateRange
- [ ] Middleware for ADMIN/TEACHER access
- [ ] Sortable columns (Date, Name, Roll Number, Status)
- [ ] Export to CSV/Excel
- [ ] Sticky table headers
- [ ] Server-side pagination
- [ ] Notes for each attendance record
- [ ] Single and bulk delete

### Attendance Mark
- [ ] Middleware for ADMIN/TEACHER access
- [ ] Fix slow navigation after marking attendance

### Attendance Dashboard
- [ ] Middleware for ADMIN/TEACHER access
- [ ] Fix slow navigation
- [ ] Fix duplicate names issue
- [ ] Fix date display (IST format)

### Grade & Section Management
- [ ] Soft delete for sections (preserve attendance data)
- [ ] Enforce section naming rules (A, B, C, CUBE, CHESS - not "Section-A")
- [ ] Empty states for section and grade
- [ ] Assign teacher to section
- [ ] Fix delete click issue
- [ ] Improve loading performance
- [ ] Search functionality
- [ ] Validation for create and delete
- [ ] Show grade name in breadcrumbs (not ID)

### Fees Management
- [ ] Soft delete for sections (preserve fee data)
- [ ] Empty states for fees
- [ ] Assign students to fees
- [ ] Record fee with payment
- [ ] Send reminders (SMS, WhatsApp, Mail)
- [ ] Download fees details
- [ ] Download receipts
- [ ] Reminder history component

### Pending Pages
- [ ] Dashboard for each role
- [ ] Settings page for each role

### Parent Module
- [ ] Remark page
- [ ] Fees page: handle "No data found" state
- [ ] Notice page: handle "No notice found" state

### Student Module
- [ ] Assignments page
- [ ] Attendance page: show only own attendance
- [ ] Teacher feedback
- [ ] My documents
- [ ] Update profile

---

## Planned Features

### Platform-Wide
- [ ] Not boring UI like PHP: Build with latest stack (Next.js, premium tech)
- [ ] School/College/Coaching Classes easy onboarding
- [ ] Role-based access [TEACHER, ADMIN, STUDENT, PARENT]
- [ ] Multi-tenant platform

### Fee Management System
- [ ] Monthly collection tracking
- [ ] Fee reminders sender (manual/automated)
- [ ] Online fee payment option
- [ ] Receipts by email/SMS/WhatsApp or direct download
- [ ] Students/Parents: track their own fees
- [ ] Teacher/Admin: manage all fees

### Class Management
- [ ] Add/Delete grades/classes
- [ ] Add/Delete sections/streams
- [ ] Assign teacher to section/stream

### Student Management
- [ ] Create student
- [ ] Manage/delete students

### Holiday Management
- [ ] Emergency holiday declaration
- [ ] Import by Google Sheet / single / bulk / CSV template
- [ ] Delete holidays

### Attendance Management
- [ ] Section-wise attendance analytics
- [ ] Student history with status
- [ ] One-click AI suggestion for late/absent
- [ ] All students history

### Complaint Management
- [ ] Anonymous complaints for students and parents
- [ ] Teacher investigation and status updates
- [ ] Track complaint status

### Notice Board
- [ ] Notice approve/reject system
- [ ] Received by mail, WhatsApp/SMS
- [ ] Push notifications

### Settings
- [ ] Organization configuration
- [ ] Student profile editing
- [ ] Teacher profile updates
- [ ] Parent: see connected parents and update IsPrimary
