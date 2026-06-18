import {
    ImportFieldDef,
    ImporterConfig,
    ValidationRule,
} from "@/types/importer"
import { Gender, StudentStatus } from "@/generated/prisma/enums"
import { bulkImportStudents } from "./action"
import { StudentCsvRow } from "./types"
import { BLOOD_GROUP_DISPLAY_VALUES, parseDate } from "@/lib/importer/parsers"

export const STUDENT_FIELDS: ImportFieldDef<StudentCsvRow>[] = [
    // identity
    { key: "firstName", label: "First name", group: "identity", required: true },
    { key: "lastName", label: "Last name", group: "identity", required: true },
    { key: "middleName", label: "Middle name", group: "identity" },
    { key: "motherName", label: "Mother name", group: "identity" },
    {
        key: "rollNumber", label: "Roll number", group: "identity", required: true,
        hint: "Unique per organization",
    },
    {
        key: "dateOfBirth", label: "Date of birth", group: "identity", required: true,
        hint: "YYYY-MM-DD or DD/MM/YYYY",
        transform: (v) => v.trim(),
    },
    {
        key: "gender", label: "Gender", group: "identity", required: true,
        hint: "MALE | FEMALE | OTHER",
        transform: (v) => v.toUpperCase().trim(),
    },
    { key: "bloodGroup", label: "Blood group", group: "identity", hint: "A+ A- B+ B- AB+ AB- O+ O-" },
    { key: "admissionDate", label: "Admission date", group: "identity", hint: "YYYY-MM-DD" },
    // contact
    {
        key: "email", label: "Email", group: "contact", required: true,
        transform: (v) => v.toLowerCase().trim(),
    },
    { key: "phoneNumber", label: "Phone", group: "contact", required: true },
    { key: "whatsAppNumber", label: "WhatsApp", group: "contact", required: true },
    { key: "emergencyContact", label: "Emergency contact", group: "contact" },
    { key: "address", label: "Address", group: "contact" },
    // academic
    {
        key: "grade", label: "Grade / class", group: "academic", required: true,
        hint: "Must match existing grade name",
    },
    {
        key: "section", label: "Section", group: "academic", required: true,
        hint: "Must match section name in that grade",
    },
    {
        key: "status", label: "Status", group: "academic",
        hint: "ACTIVE | INACTIVE | SUSPENDED | TRANSFERRED | DROPPED | GRADUATED",
        transform: (v) => v.toUpperCase().trim(),
    },
    { key: "caste", label: "Caste", group: "academic" },
    { key: "subCaste", label: "Sub caste", group: "academic" },
    // parent
    { key: "parentFirstName", label: "Parent first name", group: "parent" },
    { key: "parentLastName", label: "Parent last name", group: "parent" },
    {
        key: "parentEmail", label: "Parent email", group: "parent",
        transform: (v) => v.toLowerCase().trim(),
    },
    { key: "parentPhone", label: "Parent phone", group: "parent" },
    { key: "parentWhatsApp", label: "Parent WhatsApp", group: "parent" },
    {
        key: "relationship", label: "Relationship", group: "parent",
        hint: "FATHER | MOTHER | GUARDIAN | OTHER",
        transform: (v) => v.toUpperCase().trim(),
    },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_GENDERS: string[] = Object.values(Gender)
const VALID_STATUSES: string[] = [...Object.values(StudentStatus), ""]

export const STUDENT_RULES: ValidationRule<StudentCsvRow>[] = [
    {
        field: "email",
        validate: (v) => (v && !EMAIL_RE.test(v) ? "Invalid email format" : null),
    },
    {
        field: "parentEmail",
        validate: (v) => (v && !EMAIL_RE.test(v) ? "Invalid parent email format" : null),
    },
    {
        field: "gender",
        validate: (v) =>
            v && !VALID_GENDERS.includes(v)
                ? `Gender must be one of: ${VALID_GENDERS.join(", ")}`
                : null,
    },
    {
        field: "status",
        validate: (v) =>
            v && !VALID_STATUSES.includes(v)
                ? `warn: Status "${v}" not recognised — defaulting to ACTIVE`
                : null,
    },
    {
        field: "bloodGroup",
        validate: (v) =>
            v && !BLOOD_GROUP_DISPLAY_VALUES.includes(v)
                ? `Blood group must be one of: ${BLOOD_GROUP_DISPLAY_VALUES.filter(Boolean).join(", ")}`
                : null,
    },
    {
        field: "dateOfBirth",
        validate: (v) =>
            v && !parseDate(v) ? "Invalid date — use YYYY-MM-DD or DD/MM/YYYY" : null,
    },
    {
        field: "admissionDate",
        validate: (v) =>
            v && !parseDate(v) ? "warn: Admission date invalid — will be skipped" : null,
    },
    {
        field: "rollNumber",
        validate: (v, _row, allRows) => {
            if (!v) return null
            const count = allRows.filter((r) => r.rollNumber === v).length
            return count > 1 ? `Duplicate roll number "${v}" within this file` : null
        },
    },
]

export const STUDENT_TEMPLATE_ROWS: Partial<StudentCsvRow>[] = [
    {
        firstName: "Aarav", lastName: "Patel", rollNumber: "101",
        dateOfBirth: "2012-05-10", gender: "MALE",
        email: "aarav.patel@example.com", phoneNumber: "9876543210",
        whatsAppNumber: "9876543210", grade: "1st", section: "A",
        admissionDate: "2023-06-01", bloodGroup: "A+", status: "ACTIVE",
        parentFirstName: "Raj", parentLastName: "Patel",
        parentEmail: "raj.patel@example.com", parentPhone: "9876543211",
        relationship: "FATHER",
    },
    {
        firstName: "Ananya", lastName: "Iyer", rollNumber: "102",
        dateOfBirth: "2012-08-22", gender: "FEMALE",
        email: "ananya.iyer@example.com", phoneNumber: "9876543212",
        whatsAppNumber: "9876543212", grade: "1st", section: "A",
        admissionDate: "2023-06-01", bloodGroup: "B+", status: "ACTIVE",
        parentFirstName: "Lata", parentLastName: "Iyer",
        parentEmail: "lata.iyer@example.com", parentPhone: "9876543213",
        relationship: "MOTHER",
    },
    {
        firstName: "Ishaan", lastName: "Sharma", rollNumber: "103",
        dateOfBirth: "2013-01-15", gender: "MALE",
        email: "ishaan.sharma@example.com", phoneNumber: "9876543214",
        whatsAppNumber: "9876543214", grade: "1st", section: "B",
        admissionDate: "2023-06-01", bloodGroup: "O+", status: "ACTIVE",
        parentFirstName: "Amit", parentLastName: "Sharma",
        parentEmail: "amit.sharma@example.com", parentPhone: "9876543215",
        relationship: "FATHER",
    },
    {
        firstName: "Priya", lastName: "Singh", rollNumber: "104",
        dateOfBirth: "2012-11-30", gender: "FEMALE",
        email: "priya.singh@example.com", phoneNumber: "9876543216",
        whatsAppNumber: "9876543216", grade: "1st", section: "B",
        admissionDate: "2023-06-01", bloodGroup: "AB+", status: "ACTIVE",
        parentFirstName: "Neelam", parentLastName: "Singh",
        parentEmail: "neelam.singh@example.com", parentPhone: "9876543217",
        relationship: "MOTHER",
    },
]

export const studentImporterConfig: ImporterConfig<StudentCsvRow> = {
    entity: "student",
    label: "Students",
    fields: STUDENT_FIELDS,
    rules: STUDENT_RULES,
    handler: bulkImportStudents,
    maxRows: 1000,
    templateRows: STUDENT_TEMPLATE_ROWS,
}
