"use server"

import prisma from "@/lib/db";
import { getOrganizationId } from "@/lib/organization";
import { getActiveAcademicYearId } from "@/lib/academicYear";

export interface CertificateStudentData {
  id: string;
  rollNo: string;
  profileImage: string | null;
  name: string;
  section: string;
  grade: string;
  year: string;
  dateOfBirth: Date | null;
  motherName: string;
  fatherName: string;
  caste: string;
  nationality: string;
  admissionDate: Date | null;
  attendancePercent: string;
  totalDays: number;
  presentDays: number;
  totalMarks: number;
  outOf: number;
  examGrade: string;
  result: string;
  feeStatus: "PAID" | "UNPAID";
}

export interface OrganizationData {
  name: string;
  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;
  establishedYear: number | null;
  organizationType: string | null;
}

function parentFullName(
  parent: { firstName: string; lastName: string } | undefined
): string {
  return parent ? `${parent.firstName} ${parent.lastName}` : 'N/A';
}

export async function getStudentsForCertificateGenerator(): Promise<{
  students: CertificateStudentData[];
  organization: OrganizationData;
}> {
  const [organizationId, academicYearId] = await Promise.all([
    getOrganizationId(),
    getActiveAcademicYearId(),
  ]);

  const [students, organization, academicYear] = await Promise.all([
    prisma.student.findMany({
      where: { organizationId, status: 'ACTIVE' },
      select: {
        id: true,
        rollNumber: true,
        profileImage: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        caste: true,
        admissionDate: true,
        createdAt: true,
        grade: {
          select: { grade: true },
        },
        section: {
          select: { name: true },
        },
        parents: {
          select: {
            relationship: true,
            parent: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        StudentAttendance: {
          where: { academicYearId },
          select: { status: true },
        },
        examResult: {
          where: {
            exam: {
              examSession: { academicYearId },
            },
          },
          select: {
            obtainedMarks: true,
            gradeLabel: true,
            isPassed: true,
            isAbsent: true,
            exam: {
              select: { maxMarks: true },
            },
          },
        },
        Fee: {
          where: { academicYearId },
          select: {
            totalFee: true,
            paidAmount: true,
          },
        },
      },
      orderBy: [
        { grade: { grade: 'asc' } },
        { lastName: 'asc' },
      ],
    }),

    prisma.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: {
        name: true,
        contactPhone: true,
        contactEmail: true,
        website: true,
        establishedYear: true,
        organizationType: true,
      },
    }),

    prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { name: true },
    }),
  ]);

  const yearLabel = academicYear?.name ?? new Date().getFullYear().toString();

  const mappedStudents: CertificateStudentData[] = students.map(student => {
    const father = student.parents.find(p => p.relationship === 'FATHER')
      ?? student.parents.find(p => p.relationship === 'GUARDIAN');
    const mother = student.parents.find(p => p.relationship === 'MOTHER');

    // Attendance calculation
    const totalDays = student.StudentAttendance.length;
    const presentDays = student.StudentAttendance.filter(
      a => a.status === 'PRESENT'
    ).length;
    const attendancePercent = totalDays > 0
      ? `${((presentDays / totalDays) * 100).toFixed(1)}%`
      : 'N/A';

    // Exam results calculation — skip absent results
    const presentResults = student.examResult.filter(r => !r.isAbsent);
    const totalMarks = presentResults.reduce(
      (sum, r) => sum + (r.obtainedMarks ?? 0), 0
    );
    const outOf = presentResults.reduce(
      (sum, r) => sum + (r.exam.maxMarks ?? 0), 0
    );
    const examGrade = student.examResult.at(-1)?.gradeLabel ?? 'N/A';
    const result = presentResults.length > 0
      ? (presentResults.every(r => r.isPassed) ? 'PASS' : 'FAIL')
      : 'N/A';

    const admissionSource = student.admissionDate ?? student.createdAt;

    // Fee status calculation
    const totalFees = student.Fee.reduce((sum, f) => sum + f.totalFee, 0);
    const totalPaid = student.Fee.reduce((sum, f) => sum + f.paidAmount, 0);
    const feeStatus: "PAID" | "UNPAID" = totalFees === 0 || totalPaid >= totalFees
      ? "PAID"
      : "UNPAID";

    return {
      id: student.id,
      rollNo: student.rollNumber,
      profileImage: student.profileImage,
      name: `${student.firstName} ${student.middleName ?? ''} ${student.lastName}`.trim(),
      grade: student.grade?.grade ?? 'N/A',
      section: student.section?.name ?? 'N/A',
      year: yearLabel,
      dateOfBirth: student.dateOfBirth,
      motherName: parentFullName(mother?.parent),
      fatherName: parentFullName(father?.parent),
      caste: student.caste ?? 'N/A',
      nationality: 'Indian',
      admissionDate: admissionSource,
      attendancePercent,
      totalDays,
      presentDays,
      totalMarks,
      outOf,
      examGrade,
      result,
      feeStatus,
    };
  });

  return { students: mappedStudents, organization };
}