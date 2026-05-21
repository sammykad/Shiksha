# SHIKSHA.CLOUD — STUDENT CREATION SCHEMA REFERENCE

## FIELD REQUIREMENTS (from `lib/schemas.ts` — `studentSchema` + `parentSchema`)

### STUDENT FIELDS

| Field | Required | Type | Validation | Example | Notes |
|-------|----------|------|------------|---------|-------|
| `firstName` | ✅ REQUIRED | string | min 1 char | `"Aarav"` | |
| `middleName` | ⬜ OPTIONAL | string | — | `"Raj"` | |
| `lastName` | ✅ REQUIRED | string | min 1 char | `"Sharma"` | |
| `email` | ✅ REQUIRED | string | valid email, **globally unique** | `"aarav.sharma@shiksha.cloud"` | Used for login |
| `phoneNumber` | ✅ REQUIRED | string | min 10 digits | `"9876543210"` | Used as **initial login password** for student |
| `whatsAppNumber` | ✅ REQUIRED | string | min 10 digits | `"9876543210"` | Parent's WhatsApp number for alerts |
| `rollNumber` | ✅ REQUIRED | string | min 1 char, unique per org | `"1"` | |
| `dateOfBirth` | ✅ REQUIRED | Date | must be in the past | `"2010-03-15"` | ISO format |
| `gender` | ✅ REQUIRED | enum | `MALE`, `FEMALE`, `OTHER` | `"MALE"` | Uppercase |
| `gradeId` | ✅ REQUIRED | string (UUID) | min 1 char | `"clx123..."` | From system — **admin creates grades first** |
| `sectionId` | ✅ REQUIRED | string (UUID) | min 1 char | `"cly456..."` | From system — **admin creates sections first** |
| `emergencyContact` | ✅ REQUIRED | string | min 1 char | `"9876543211"` | |
| `motherName` | ⬜ OPTIONAL | string | — | `"Sunita Sharma"` | |
| `fullName` | ⬜ OPTIONAL | string | auto-generated if omitted | `"Aarav Raj Sharma"` | Auto-built from first+middle+last |
| `profileImage` | ⬜ OPTIONAL | string | — | `"https://..."` | |
| `parents` | ⬜ OPTIONAL | array | **min 1 parent if provided** | `[{...}]` | If omitted, no parent accounts created |

### PARENT FIELDS (inside `parents[]` array)

| Field | Required | Type | Validation | Example | Notes |
|-------|----------|------|------------|---------|-------|
| `firstName` | ✅ REQUIRED | string | min 1 char | `"Rajesh"` | |
| `lastName` | ✅ REQUIRED | string | min 1 char | `"Sharma"` | |
| `email` | ✅ REQUIRED | string | valid email, **globally unique** | `"rajesh.sharma@gmail.com"` | Used for parent login |
| `phoneNumber` | ✅ REQUIRED | string | min 10 digits | `"9876543210"` | Used as **initial login password** for parent |
| `whatsAppNumber` | ⬜ OPTIONAL | string | min 10 digits if provided | `"9876543210"` | Defaults to nothing if omitted |
| `relationship` | ✅ REQUIRED | enum | `FATHER`, `MOTHER`, `GUARDIAN`, `OTHER` | `"FATHER"` | Uppercase |
| `isPrimary` | ⬜ OPTIONAL | boolean | defaults `false` | `true` | Mark ONE parent as primary |

---

## WHAT HAPPENS WHEN YOU CREATE A STUDENT

The `create-student.ts` server action does ALL of this in one transaction:

### Step 1: Clerk (Auth System)
1. **Creates Clerk user for student** — email + firstName + lastName + password (=phoneNumber)
2. **Adds student to organization** — role: `org:student`
3. **Sends invite email** to student
4. **For each parent:** Creates Clerk user for parent — email + firstName + lastName + password (=phoneNumber)
5. **Adds each parent to organization** — role: `org:parent`
6. **Sends invite email** to each parent

### Step 2: Database (Prisma Transaction)
1. **Creates `User` record** for student (links to Clerk ID)
2. **Creates `Student` record** with all fields + links to section, grade, organization
3. **For each parent:**
   - Creates `User` record for parent
   - Creates `Parent` record (phoneNumber, whatsAppNumber, email, names)
   - Creates `ParentStudent` join record (relationship, isPrimary)

### Step 3: Cleanup on Failure
If ANY step fails → all Clerk users created during the run are deleted (rollback).

---

## MINIMUM DATA NEEDED FOR 1 STUDENT

```
firstName:    "Aarav"
lastName:     "Sharma"
email:        "aarav@shiksha.cloud"
phoneNumber:  "9876543210"
whatsAppNumber: "9876543210"
rollNumber:   "1"
dateOfBirth:  "2010-03-15"
gender:       "MALE"
gradeId:      "<UUID from system>"
sectionId:    "<UUID from system>"
emergencyContact: "9876543211"

parents: [{
  firstName:    "Rajesh"
  lastName:     "Sharma"
  email:        "rajesh@gmail.com"
  phoneNumber:  "9876543210"
  relationship: "FATHER"
  isPrimary:    true
}]
```

That's it. 11 student fields + 6 parent fields = **17 data points per student**.

---

## WHAT THE SCHOOL CAN SKIP ON DAY 1

| Field | Can skip? | Why |
|-------|-----------|-----|
| `middleName` | ✅ Yes | Not critical |
| `motherName` | ✅ Yes | Nice-to-have |
| `fullName` | ✅ Yes | Auto-generated |
| `profileImage` | ✅ Yes | Can upload later |
| `parents[0].whatsAppNumber` | ✅ Yes | Falls back to showing phone in UI |
| `parents[0].isPrimary` | ⚠️ Should set | If only 1 parent, set `true` |
| Second parent | ✅ Yes | Add later if needed |

---

## THE REAL-WORLD IMPORT FLOW

Since `gradeId` and `sectionId` are UUIDs the school doesn't know yet, here's the actual workflow:

### Option A: Sameer does the import (RECOMMENDED)
1. School sends raw student data (name, DOB, grade name, section name, parent info)
2. Sameer creates grades + sections in the system first
3. Sameer writes a one-time script that maps grade names → gradeIds and bulk-creates all students
4. Done in 15 minutes for 100 students

### Option B: School uses the UI (SLOW)
1. Sameer creates grades + sections, sends UUIDs to school
2. School admin manually adds each student one-by-one via `/dashboard/students`
3. Takes ~3 minutes per student = 30 minutes for 10 students

### Option C: School sends Excel, Sameer imports via API
1. School fills the CSV template
2. Sameer writes a Node.js script to parse CSV → call `createStudent()` for each row
3. Done in 5 minutes for 100 students

**For Day 1 with one school: Use Option C.** Send them the CSV template, they fill it, you run a 20-line import script.

---

## 10 SAMPLE STUDENTS — READY-TO-USE DATA

All students in Grade 10, Sections A and B. School: "Pune Public School".

| # | Student Name | DOB | Gender | Section | Roll | Student Email | Phone | Parent Name | Parent Email | Parent Phone |
|---|-------------|-----|--------|---------|------|---------------|-------|-------------|--------------|--------------|
| 1 | Aarav Raj Sharma | 2010-03-15 | MALE | A | 1 | aarav.sharma@shiksha.cloud | 9876543210 | Rajesh Sharma | rajesh.sharma@gmail.com | 9876543210 |
| 2 | Priya Amit Patil | 2010-07-22 | FEMALE | A | 2 | priya.patil@shiksha.cloud | 9876543220 | Amit Patil | amit.patil@gmail.com | 9876543220 |
| 3 | Rohan Vijay Kulkarni | 2010-01-10 | MALE | A | 3 | rohan.kulkarni@shiksha.cloud | 9876543230 | Vijay Kulkarni | vijay.k@gmail.com | 9876543230 |
| 4 | Sneha Suresh Deshmukh | 2010-11-05 | FEMALE | B | 4 | sneha.deshmukh@shiksha.cloud | 9876543240 | Suresh Deshmukh | suresh.d@gmail.com | 9876543240 |
| 5 | Arjun Pravin Jadhav | 2010-05-18 | MALE | B | 5 | arjun.jadhav@shiksha.cloud | 9876543250 | Pravin Jadhav | pravin.j@gmail.com | 9876543250 |
| 6 | Komal Mahesh Gaikwad | 2010-09-30 | FEMALE | B | 6 | komal.gaikwad@shiksha.cloud | 9876543260 | Mahesh Gaikwad | mahesh.g@gmail.com | 9876543260 |
| 7 | Aditya Deepak More | 2010-02-14 | MALE | A | 7 | aditya.more@shiksha.cloud | 9876543270 | Deepak More | deepak.m@gmail.com | 9876543270 |
| 8 | Isha Ramesh Pawar | 2010-06-25 | FEMALE | A | 8 | isha.pawar@shiksha.cloud | 9876543280 | Ramesh Pawar | ramesh.p@gmail.com | 9876543280 |
| 9 | Sagar Anil Bhosale | 2010-04-08 | MALE | B | 9 | sagar.bhosale@shiksha.cloud | 9876543290 | Anil Bhosale | anil.b@gmail.com | 9876543290 |
| 10 | Neha Sanjay Chavan | 2010-12-20 | FEMALE | B | 10 | neha.chavan@shiksha.cloud | 9876543300 | Sanjay Chavan | sanjay.c@gmail.com | 9876543300 |

All phone numbers also serve as WhatsApp numbers and initial login passwords.
