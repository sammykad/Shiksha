# SHIKSHA.CLOUD — SINGLE SCHOOL ONBOARDING CHECKLIST

## 1. SCHOOL PROFILE
- [ ] School full legal name
- [ ] School type (School / College / Coaching / University / Kindergarten / Training Institute / Other)
- [ ] School slug (URL-friendly, e.g., `pune-public-school`)
- [ ] Contact email
- [ ] Contact phone
- [ ] Website URL
- [ ] School logo (PNG/SVG)
- [ ] School address
- [ ] School code (if government-registered)

## 2. ACADEMIC YEAR
- [ ] Year name (e.g., "2025-2026")
- [ ] Start date (YYYY-MM-DD)
- [ ] End date (YYYY-MM-DD)
- [ ] Year type (Annual / Semester / Trimester / Batch)
- [ ] Description (optional)

## 3. GRADES & SECTIONS
- [ ] List of all grades (e.g., Nursery, LKG, UKG, 1st–12th or FY, SY, TY)
- [ ] Sections per grade (A, B, C or single)
- [ ] Class teacher per section (optional, assign later)
- [ ] Section capacity (optional)

## 4. STUDENT DATA (one row per student)
- [ ] First name
- [ ] Middle name (optional)
- [ ] Last name
- [ ] Email (unique, used for login)
- [ ] Phone number (10 digits, used as initial password)
- [ ] WhatsApp number (10 digits, for parent alerts)
- [ ] Roll number (unique per grade)
- [ ] Date of birth (YYYY-MM-DD)
- [ ] Gender (MALE / FEMALE / OTHER)
- [ ] Assigned grade
- [ ] Assigned section
- [ ] Emergency contact phone
- [ ] Mother's name (optional)
- [ ] Student photo (optional)

## 5. PARENT DATA (at least 1 per student, max 2)
- [ ] Parent first name
- [ ] Parent last name
- [ ] Parent email (unique, used for login)
- [ ] Parent phone (10 digits, used as initial password)
- [ ] Parent WhatsApp number (optional, defaults to phone)
- [ ] Relationship (FATHER / MOTHER / GUARDIAN / OTHER)
- [ ] Is primary contact (true/false — exactly ONE per student)

## 6. TEACHER DATA
- [ ] Teacher first name
- [ ] Teacher last name
- [ ] Teacher email (unique, used for login)
- [ ] Employee code
- [ ] Phone number
- [ ] Qualification (optional)
- [ ] Employment status (ACTIVE / ON_LEAVE / etc.)
- [ ] Department (optional)

## 7. SUBJECTS
- [ ] Subject name (per grade)
- [ ] Subject code (optional)
- [ ] Subject type (optional)

## 8. TEACHING ASSIGNMENTS
- [ ] Which teacher teaches which subject
- [ ] For which grade
- [ ] For which section
- [ ] For which academic year

## 9. FEE STRUCTURE
- [ ] Fee categories (Tuition / Transport / Exam / Lab / Activity / Sports / Library / Other)
- [ ] Fee amount per category per grade
- [ ] Fee frequency (Monthly / Quarterly / Annually / One-time)
- [ ] Due date per fee
- [ ] Which students owe which fees (bulk assign by grade/section)
- [ ] Payment link / gateway details (if online payments enabled)

## 10. HOLIDAY CALENDAR
- [ ] List of planned holidays (date + name + type)
- [ ] Emergency holiday declaration contact person
- [ ] Academic calendar start/end confirmed

## 11. NOTIFICATION SETUP
- [ ] WhatsApp Business API connected (or confirm using built-in)
- [ ] SMS gateway configured
- [ ] Email sender verified (Resend domain)
- [ ] Notification preferences per type (which channels for attendance, fees, notices, exams)
- [ ] Default notification language (English / Hindi / Both)

## 12. EXAM SETUP (if exam season is near)
- [ ] Exam session name (e.g., "Midterm 2025")
- [ ] Exam dates and times
- [ ] Subjects per exam
- [ ] Students enrolled per exam
- [ ] Exam mode (Online / Offline / Practical)
- [ ] Grading scale (if custom)

## 13. DOCUMENT REQUIREMENTS
- [ ] List of required document types (Aadhaar / PAN / Passport / Birth Certificate / Transfer Certificate / Bank Passbook / Parent ID / Other)
- [ ] Which documents are mandatory per student
- [ ] Which documents are optional

## 14. NOTICES / CIRCULARS
- [ ] First welcome notice to all parents (content, priority, publish date)
- [ ] Any urgent circulars to broadcast immediately

## 15. NOTIFICATIONS TEST
- [ ] Mark 3 test students absent → verify parent gets WhatsApp/SMS
- [ ] Mark 1 test student late → verify parent gets alert
- [ ] Create test fee → verify parent gets fee notification
- [ ] Publish test notice → verify all users receive it
- [ ] Test payment receipt flow (record offline payment → verify receipt sent)

## 16. LOGIN CREDENTIALS DISTRIBUTION
- [ ] Student login emails + passwords shared with parents
- [ ] Parent login emails + passwords shared with parents
- [ ] Teacher login emails + passwords shared with teachers
- [ ] Admin knows their own Clerk login
- [ ] How-to-access guide shared (PDF or video)

## 17. TRAINING SESSIONS
- [ ] Admin training: how to add students, teachers, fees, notices
- [ ] Teacher training: how to mark attendance, view their classes
- [ ] Parent walkthrough: how to check attendance, pay fees, view notices
- [ ] Who is the school's internal point of contact for support?
- [ ] Support channel confirmed (WhatsApp / Email / Phone)

## 18. HOUSEKEEPING
- [ ] All grades created → verify in UI
- [ ] All sections created → verify in UI
- [ ] Academic year set as current → verify
- [ ] Organization settings saved → name, logo, type correct
- [ ] Notification settings configured → channels enabled per type
- [ ] Fee categories created → amounts assigned to students
- [ ] Teachers assigned to subjects/sections → verify
- [ ] At least 10 students imported → verify count
- [ ] At least 10 parent accounts active → verify
- [ ] Test attendance run → verify parent received alert
- [ ] Test fee created → verify parent received notification
- [ ] Test notice published → verify delivery

---

## WHAT THE SCHOOL BRINGS TO YOU

- [ ] Student Excel sheet (filled CSV template)
- [ ] Teacher list (name, email, employee code)
- [ ] Fee structure document (amounts per grade per category)
- [ ] Holiday list for the year
- [ ] Grade + section structure (which grades, how many sections each)
- [ ] School logo file
- [ ] List of subjects per grade
