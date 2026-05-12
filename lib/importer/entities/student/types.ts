// lib/importer/entities/student/types.ts

export interface StudentCsvRow {
  // Required
  firstName: string
  lastName: string
  rollNumber: string
  dateOfBirth: string
  gender: string
  email: string
  phoneNumber: string
  whatsAppNumber: string
  grade: string
  section: string
  // Optional
  middleName: string
  motherName: string
  admissionDate: string
  bloodGroup: string
  address: string
  caste: string
  subCaste: string
  emergencyContact: string
  status: string
  // Parent
  parentFirstName: string
  parentLastName: string
  parentEmail: string
  parentPhone: string
  parentWhatsApp: string
  relationship: string
}
