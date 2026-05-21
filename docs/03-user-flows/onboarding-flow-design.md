make the wizard linear but smart.

PROPER ONBOARDING FLOW (12 Steps)
PHASE 1: FOUNDATION (Can't skip these)

Organization Setup

Name, type (school/college/coaching), contact info, logo
Unlocks: Step 2


Academic Year Configuration

Name (2024-25), dates, type (annual/semester), mark as current
Unlocks: Phase 2




PHASE 2: STRUCTURE (Foundation for everything else)

Create Grades

Grade names (10, 11, 12 / or Year 1, 2, 3 / or Batch A, B)
Unlocks: Step 4


Create Sections

Sections per grade (A, B, C, etc.)
Optionally assign class teacher
Unlocks: Phase 3




PHASE 3: PEOPLE (Get your people in)

Add Students

Name, email, phone, WhatsApp, roll number, DOB, gender
Assign to grade & section
Unlocks: Step 6


Add Student Parents

Name, email, phone, relationship (Father/Mother/Guardian)
Mark primary parent
Unlocks: Step 7


Upload Student Documents (Optional but recommended)

Aadhaar, Birth Certificate, Transfer Certificate, etc.
Can skip and do later
Unlocks: Phase 4




PHASE 4: ACADEMIC CONFIGURATION (Make it operational)

Add Teachers

Name, email, phone, employment status
Employee code (optional)
Unlocks: Step 9


Create Subjects

Subject name & code (English, Maths, Science, etc.)
Elective? (yes/no)
Unlocks: Step 10


Create Fee Categories

Tuition, Exam Fee, Sports Fee, Lab Fee, etc.
Unlocks: Step 11


Assign Teaching (Link Teacher → Subject → Grade → Section)

Teacher selects subject, grade, section
This creates the teaching structure
Unlocks: Step 12


Assign Fees to Students

Pick student → fee category → amount → due date
Can bulk assign
Unlocks: Dashboard 🎉




WHY THIS ORDER?
StepDepends OnReason1. OrganizationNothingFoundation of everything2. Academic YearOrgAll data belongs to academic year3. GradesAcademicYearStudents need grades4. SectionsGradesStudents need sections within grades5. StudentsSectionsNow you can add them to real places6. ParentsStudentsParents are linked to students7. DocumentsStudentsDocuments belong to students8. TeachersOrgTeachers exist independently9. SubjectsOrgSubjects exist independently10. Fee CategoriesOrgCategories exist independently11. Teaching AssignTeachers + Subjects + Grades + SectionsAll pieces exist, now link them12. Student FeesStudents + Fee Categories + AcademicYearAll pieces exist, now assign

KEY INSIGHTS FOR YOUR USERS
After Step 2, show this message:

"Great! Your organization and academic year are set up. Now let's create your school structure—grades and sections. Then we'll add students, teachers, and fees."

After Step 4, show:

"Perfect! Your structure is ready. Now let's add the people—students and their parents."

After Step 7, show:

"Excellent! Now let's configure the academic side—teachers, subjects, and fees."


OPTIONAL EXTRAS (Can do anytime)

Academic Calendar: Holidays, breaks, events
Leave Management: Define leave types
Exam Sessions: Create exams later
Notification Settings: Configure channels


MIDDLEWARE LOGIC (Next.js)
User logs in → Check if onboarding done?
  ├─ Organization exists? NO → Step 1
  ├─ Academic year exists? NO → Step 2
  ├─ Grades exist? NO → Step 3
  ├─ Sections exist? NO → Step 4
  ├─ Any students? NO → Step 5
  └─ Everything done? YES → Dashboard ✅