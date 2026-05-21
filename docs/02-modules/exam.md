# Exam Module — Architecture & Workflow

## Lifecycle Pipeline

Each step is a strict "gate" — the next step cannot proceed until the previous is complete.

```
Configuration → Scheduling → Enrollment → Attendance → Marks Entry → Publish → Report Cards
```

### Step 1: Configuration

- Create Exam Session (title, date range, academic year)
- Configure Dynamic Grading Scale (TODO — currently hardcoded in `grade-utils.ts`)

### Step 2: Scheduling (Exam Creation)

- Teacher adds exams under a session
- Each exam: Subject + Grade + Section + Date + Venue + MaxMarks
- Bulk creation via AI prompt or manual spreadsheet-style form
- Problem (known): Must create separate exams per section — no cross-section grouping yet

### Step 3: Student Enrollment

- Auto-enrollment: System enrolls all students in that grade/section
- Manual enrollment: For elective subjects only
- Status: ENROLLED

### Step 4: Issue Hall Tickets

- Teacher clicks "Issue Hall Tickets" after enrollment
- System generates PDFs with QR code for enrolled students
- Updates: hallTicketIssued = true

### Step 5: Exam Attendance (MISSING — TODO)

5. Download Hall Tickets
   Students get notification
   Click "Download Hall Ticket"
   PDF with exam schedule + QR code

6. Mark Attendance (Exam Day)
   Teacher marks: ATTENDED / ABSENT
   Updates ExamEnrollment status

7. Enter Marks (Draft Mode)
   Teacher enters marks for each student
   Marks saved but NOT visible to students
   isResultsPublished = false

8. Review & Publish Results
   Teacher reviews all marks
   Clicks "Publish Results"
   isResultsPublished = true

9. View Results
   Students get notification
   Click "View Results"
   See marks, percentage, grade

10. Generate Report Cards
    After ALL exams in session completed
    Teacher clicks "Generate Report Cards"
    System calculates totals, ranks, overall grade

11. Download Report Cards

Students get notification
Download consolidated PDF
Shows all subjects + final result
Exam Management is broken :

- Dont Have Timetable(skip) ,
- Create Grade/ Section : Done
- Create Subjects: : Done
- Create Exam Session : Done
- Create Exam : Done
- Edit Exam With Limitations
- Hallticket :Qr Code Scannig: Done
- Enrollement: Done
- Exam Attendance : Missing
- Result Filling with static Grading System: Done
- Publish Results: Done
- Generate ReportCards
- Dynamic Grading System
- Setting : Dynamic Grading System
  Problem:
  When creating Math exam for Grade 10, you must create 4 separate exams (A, B, C, D)
  No way to bulk create
  No grouping of related exams
  No way to bulk create
  No grouping of related exams
