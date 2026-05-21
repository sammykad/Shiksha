# Exam Management System: Feature Overview

The Exam Management system in Nexus is designed to simplify and automate the entire examination lifecycle. From planning sessions and scheduling exams to marking attendance, entering results, and generating consolidated report cards, it provides a seamless experience for administrators, teachers, and students.

## 核心功能与使用流程 (Core Workflow)

### 1. 📅 考试阶段管理 (Exam Sessions)
Administrators create high-level containers for exams (e.g., "Midterm 2024", "Finals 2025").
- **Purpose**: Grouping exams within an academic year.
- **Data**: Title, Start/End Dates, Academic Year.

### 2. 📝 考试创建与批量化 (Exam Creation)
Teachers or Admins add individual subjects to a session.
- **Bulk Creation**: Create a "Mathematics" exam for Grade 10 and automatically generate separate instances for sections A, B, C, and D.
- **Attributes**: Subject, Grade, Section, Venue, Date, Max Marks, Passing Marks.

### 3. 👥 学生注册 (Student Enrollment)
- **Auto-Enrollment**: System automatically enrolls all students belonging to the target Grade/Section.
- **Manual Enrollment**: Option for elective subjects or specific student groups.

### 4. 🎟️ 准考证发放 (Hall Tickets)
- **Generation**: Bulk generate PDFs for all enrolled students.
- **QR Code**: Each hall ticket includes a secure QR code for entry verification.
- **Student View**: Students can download their hall tickets directly from their dashboard.

### 5. ⏱️ 考勤记录 (Marking Attendance)
Dedicated interface for teachers to mark students as `ATTENDED` or `ABSENT` on the day of the exam.
- **Impact**: Attendance status automatically syncs with the result entry form.

### 6. 📊 成绩录入与发布 (Marks Entry & Publishing)
- **Draft Mode**: Teachers enter marks and remarks privately.
- **Dynamic Grading**: Marks are automatically converted to grades (e.g., A+, B, C) based on the organization's current grading scale (CBSE, Standard, etc.).
- **Publishing**: Once reviewed, results are published for student viewing.

### 7. 📜 成绩单生成 (Report Cards)
The final step in the session lifecycle.
- **Aggregation**: Calculates total marks, percentages, and overall CGPA across all subjects in a session.
- **Ranking**: Automatically determines class and grade-level ranks.
- **Consolidated PDF**: Generates professional, ready-to-print report cards.

---

## 角色视图 (Role-Based Perspectives)

| Role | Responsibilities | Key Views |
| :--- | :--- | :--- |
| **Admin** | Create Sessions, Setup Grading Scales, Monitor Performance | Session Dashboard, Settings |
| **Teacher** | Create Exams, Mark Attendance, Enter Marks, Review Results | Exam Management, Results Form |
| **Student** | View Upcoming Exams, Download Hall Ticket, View Results | Student Dashboard, Exam History |

---

## 数据架构 (Data Anatomy)

- **`ExamSession`**: The parent container.
- **[Exam](file:///d:/nexus/components/dashboard/exam/ExamResultsForm.tsx#80-92)**: The individual subject assessment for a specific section.
- **`ExamEnrollment`**: Links students to exams and tracks hall ticket status.
- **[ExamResult](file:///d:/nexus/components/dashboard/exam/ExamResultsForm.tsx#118-702)**: Stores marks, percentage, and grade labels.
- **`ReportCard`**: The final summary of a student's performance in a session.
