'use server';
import {
  AcademicYearFormData,
  academicYearSchema,
  AcademicYearUpdateFormData,
  academicYearUpdateSchema,
  CreateTeacherFormData,
  createTeacherSchema,
  DocumentUploadFormData,
  documentUploadSchema,
  GradeFormData,
  SectionFormData,
  TeacherProfileFormData,
  teacherProfileSchema,
} from '@/lib/schemas';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { subDays } from 'date-fns';
import { Role, } from '@/generated/prisma/enums';
import { getCurrentUser, getCurrentUserId } from '@/lib/user';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { redis } from '@/lib/redis';
import { notify } from '@/lib/notifications/engine';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { toISTDate } from '@/lib/utils';
import { SupportFormData } from '@/components/website/support/SupportPopup';
import { DOCUMENT_TYPE_LABELS } from '@/types/document';
import {
  extractErrorMessage,
  sendOrganizationRoleInvitation,
  upsertUserRecord,
} from '@/lib/data/student/student-helpers';


// * CLASSES && GRADES

export async function createGrade(formData: GradeFormData) {
  const organizationId = await getOrganizationId();

  // Check if grade already exists for this organization
  const existingGrade = await prisma.grade.findFirst({
    where: {
      organizationId,
      grade: {
        equals: formData.name,
        mode: 'insensitive'
      },
    }
  });

  if (existingGrade) {
    return { error: 'Grade name already exists' };
  }

  await prisma.grade.create({
    data: {
      grade: formData.name,
      organizationId,
    },
  });

  revalidatePath('/dashboard/grades');
  redirect('/dashboard/grades');
}
export async function fetchGradesAndSections(organizationId: string) {
  const grades = await prisma.grade.findMany({
    where: { organizationId },
    select: {
      id: true,
      grade: true,
      section: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  return grades.map((grade) => ({
    id: grade.id,
    name: grade.grade,
    sections: grade.section.map((sec) => ({ id: sec.id, name: sec.name })),
  }));
}
export async function deleteGrade(formData: FormData) {
  const organizationId = await getOrganizationId();
  const gradeId = formData.get('gradeId') as string;

  await prisma.grade.delete({
    where: {
      id: gradeId,
      organizationId,
    },
  });
  revalidatePath('/dashboard/grades');

  redirect('/dashboard/grades');
}
export async function deleteSection(formData: FormData) {
  const organizationId = await getOrganizationId();
  const sectionId = formData.get('sectionId')?.toString();

  await prisma.section.delete({
    where: {
      id: sectionId,
      organizationId,
    },
  });
  revalidatePath('/dashboard/grades');

  redirect('/dashboard/grades');
}
export async function createSection(formData: SectionFormData) {
  const organizationId = await getOrganizationId();

  const gradeId = formData.gradeId

  // Check if section already exists in this grade
  const existingGrade = await prisma.section.findFirst({
    where: {
      gradeId,
      name: {
        equals: formData.name,
        mode: 'insensitive'
      },
    }
  });

  if (existingGrade) {
    return { error: 'Section name already exists in this grade' };
  }
  await prisma.section.create({
    data: {
      name: formData.name,
      gradeId,
      organizationId: organizationId,
    },
  });
  revalidatePath(`/dashboard/grades/${gradeId}`)
  redirect(`/dashboard/grades/${gradeId}`);
}


// # Student Attendance

export async function getPreviousDayAttendance(
  studentId: string,
  targetDate: Date
) {
  try {
    const previousDay = toISTDate(subDays(targetDate, 1));

    const attendanceRecord = await prisma.studentAttendance.findFirst({
      where: {
        studentId,
        date: previousDay
      },
      select: {
        id: true,
        studentId: true,
        recordedBy: true,
        note: true,
        date: true,
        status: true,
        sectionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return attendanceRecord;
  } catch (error) {
    console.error('Error fetching previous day attendance:', error);
    return null;
  }
}

export async function getSectionPreviousDayAttendance(
  sectionId: string,
  targetDate: Date
) {
  const organizationId = await getOrganizationId();
  const previousDay = toISTDate(subDays(targetDate, 1));

  return prisma.studentAttendance.findMany({
    where: {
      sectionId,
      date: previousDay,
      section: { organizationId }
    },
    select: {
      id: true,
      studentId: true,
      status: true,
      note: true,
    }
  });
}

export async function getAttendanceByDateAndSection(
  sectionId: string,
  date: Date
) {
  const organizationId = await getOrganizationId();
  const istDate = toISTDate(date);

  const records = await prisma.studentAttendance.findMany({
    where: { sectionId, date: istDate, section: { organizationId } },
    select: { studentId: true, status: true, note: true, createdAt: true },
  });

  return records; // empty array = no attendance taken yet
}
export async function deleteAttendance(ids: string[]) {
  const organizationId = await getOrganizationId();

  await prisma.studentAttendance.deleteMany({
    where: {
      id: { in: ids },
      section: { organizationId },
    },
  });
  revalidatePath('/dashboard/attendance');
  revalidatePath('/dashboard/attendance/analytics');
}

export async function getStudentMonthlyAttendance(studentId: string) {
  const academicYearId = await getActiveAcademicYearId();
  const attendanceRecords = await prisma.studentAttendance.findMany({
    where: {
      studentId: studentId,
      academicYearId,
    },
    select: {
      date: true,
      status: true,
      sectionId: true,
    },
  });

  const allMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Initialize monthly attendance with 0s
  const monthlyAttendance = allMonths.reduce(
    (acc, month) => {
      acc[month] = { month, attendance: 0 };
      return acc;
    },
    {} as Record<string, { month: string; attendance: number }>
  );

  // Process attendance data
  attendanceRecords.forEach((record) => {
    const month = new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(record.date));
    if (record.status === 'PRESENT' || record.status === 'LATE') {
      monthlyAttendance[month].attendance += 1;
    }
  });

  // Convert to an array
  return Object.values(monthlyAttendance);
}
export async function WeeklyStudentAttendance(studentId: string) {
  const academicYearId = await getActiveAcademicYearId();
  const attendanceRecords = await prisma.studentAttendance.findMany({
    where: {
      studentId,
      academicYearId,
    },
    select: { date: true, status: true },
  });

  const weeklyAttendance: Record<number, { week: number; attendance: number }> =
    {};

  attendanceRecords.forEach((record) => {
    const istDate = new Date(new Date(record.date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const weekNumber = Math.ceil(istDate.getDate() / 7); // Week 1-4 in a month

    if (!weeklyAttendance[weekNumber]) {
      weeklyAttendance[weekNumber] = { week: weekNumber, attendance: 0 };
    }

    if (record.status === 'PRESENT' || record.status === 'LATE') {
      weeklyAttendance[weekNumber].attendance += 1;
    }
  });

  return Object.values(weeklyAttendance);
}
export async function yearlyStudentAttendance(studentId: string) {
  const academicYearId = await getActiveAcademicYearId();
  const academicYear = await prisma.academicYear.findUnique({
    where: { id: academicYearId },
    select: { name: true }
  });

  const attendanceRecords = await prisma.studentAttendance.count({
    where: {
      studentId,
      academicYearId,
      status: { in: ['PRESENT', 'LATE'] }
    },
  });

  return {
    year: academicYear?.name || new Date().getFullYear().toString(),
    attendance: attendanceRecords
  };
}

// Fees

export async function getDashboardStats(organizationId: string) {
  const academicYearId = await getActiveAcademicYearId();

  const [totalRevenue, totalPending, studentCount, feeCategoryCount] =
    await Promise.all([
      prisma.fee.aggregate({
        where: { organizationId, academicYearId },
        _sum: { paidAmount: true },
      }),
      prisma.fee.aggregate({
        where: { organizationId, academicYearId },
        _sum: { pendingAmount: true },
      }),
      prisma.student.count({
        where: { organizationId },
      }),
      prisma.feeCategory.count({
        where: { organizationId },
      }),
    ]);

  return {
    totalRevenue: totalRevenue._sum.paidAmount || 0,
    pendingFees: totalPending._sum.pendingAmount || 0,
    totalStudents: studentCount,
    feeCategoryCount,
  };
}



export async function uploadStudentDocuments(
  data: DocumentUploadFormData,
  documentUrl: string,
  studentId: string
) {
  const user = await getCurrentUser();
  const organizationId = await getOrganizationId();

  const validatedData = documentUploadSchema.parse(data);

  const uploadedBy =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown';

  const document = await prisma.studentDocument.create({
    data: {
      organizationId,
      documentUrl,
      uploadedBy,
      uploadedAt: new Date(),
      note: validatedData.note ?? '',
      type: validatedData.type,
      fileName: validatedData.file.name,
      fileSize: validatedData.file.size,
      fileType: validatedData.file.type,
      studentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  revalidatePath('/dashboard/documents');
  revalidatePath('/dashboard/documents/verification');

  return document;
}

export async function studentDocumentsDelete(documentId: string) {
  const organizationId = await getOrganizationId();

  const deletedDocument = await prisma.studentDocument.delete({
    where: {
      id: documentId,
      organizationId,
    },
  });

  revalidatePath('/dashboard/documents');
  revalidatePath('/dashboard/documents/verification');

  return deletedDocument;
}

export async function verifyDocument(
  documentId: string,
  note: string | null
) {
  try {
    const user = await getCurrentUser();
    const organizationId = await getOrganizationId();

    const document = await prisma.studentDocument.update({
      where: { id: documentId, organizationId },
      data: {
        verified: true,
        verifiedBy:
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          'Verified By System',
        verifiedAt: new Date(),
        rejected: false,
        rejectedBy: null,
        rejectedAt: null,
        note: note,
      },
      select: {
        id: true,
        fileName: true,
        type: true,
        documentUrl: true,
        fileSize: true,
        uploadedAt: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: {
          select: {
            name: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
      },
    });

    const studentName = document.student.firstName + ' ' + document.student.lastName;

    // Send notification
    await notify({
      templateId: 'DOCUMENT_APPROVED',
      eventId: document.id,
      organizationId,
      recipients: [{ studentId: document.student.id }],
      variables: {
        documentName: document.fileName || "Unnamed Document",
        documentType: DOCUMENT_TYPE_LABELS[document.type],
        organizationName: document.organization?.name || "Shiksha Cloud",
        recipientName: studentName,
        documentUrl: document.documentUrl,
        supportEmail: document.organization?.contactEmail || "support@shiksha.cloud",
        supportPhone: document.organization?.contactPhone || "+91 8459324821",
        uploadedOn: document.uploadedAt,
        fileSize: document.fileSize ? `${(document.fileSize / 1024).toFixed(1)} KB` : undefined,
      },
    }).catch((err) => {
      console.error("Failed to send approval notification:", err);
    });

    revalidatePath('/dashboard/documents');
    revalidatePath('/dashboard/documents/verification');

    return {
      success: true,
      message: `Document ${document.fileName || 'unnamed'} verified successfully.`,
    };
  } catch (error) {
    console.error('Error verifying document:', error);
    return {
      success: false,
      error: 'Something went wrong while verifying the document.',
    };
  }
}

export async function rejectDocument(
  documentId: string,
  rejectionReason: string
) {
  try {
    const organizationId = await getOrganizationId();
    const user = await getCurrentUser();
    const adminName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Administrator';

    const document = await prisma.studentDocument.update({
      where: { id: documentId, organizationId },
      data: {
        rejected: true,
        rejectedBy:
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          'Rejected By System',
        rejectedAt: new Date(),
        rejectReason: rejectionReason,
        verified: false,
        verifiedBy: null,
        verifiedAt: null,
      },
      select: {
        id: true,
        fileName: true,
        type: true,
        documentUrl: true,
        fileSize: true,
        uploadedAt: true,
        rejectedAt: true,
        rejectedBy: true,
        rejectReason: true,

        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: {
          select: {
            name: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
      },
    });

    const studentName =
      document.student.firstName + ' ' + document.student.lastName;

    // Send notification
    await notify({
      templateId: 'DOCUMENT_REJECTED',
      eventId: document.id,
      organizationId,
      recipients: [{ studentId: document.student.id }],
      variables: {
        documentName: document.fileName || "Unnamed Document",
        documentType: DOCUMENT_TYPE_LABELS[document.type],
        rejectReason: rejectionReason || "System Rejected",
        organizationName: document.organization?.name || "Shiksha Cloud",
        recipientName: studentName,
        documentUrl: document.documentUrl,
        supportEmail:
          document.organization?.contactEmail || "support@shiksha.cloud",
        supportPhone:
          document.organization?.contactPhone || "+91 8459324821",
        uploadedOn: document.uploadedAt,
      },
    }).catch((err) => {
      console.error("Failed to send rejection notification:", err);
    });


    revalidatePath('/dashboard/documents');
    revalidatePath('/dashboard/documents/verification');

    return {
      success: true,
      message: `Document rejected and student notified.`,
    };
  } catch (error) {
    console.error('Error rejecting document:', error);
    return {
      success: false,
      error: 'Something went wrong while rejecting the document.',
    };
  }
}

export async function updateTeacherProfileAction({
  teacherId,
  data,
}: {
  teacherId: string;
  data: TeacherProfileFormData;
}) {
  const validatedData = teacherProfileSchema.parse(data);

  // Convert { title, url }[] → string[]
  const certificateUrls: string[] =
    validatedData.certificateUrls?.map((file) => file.url) || [];

  const existingProfile = await prisma.teacherProfile.findUnique({
    where: { teacherId },
  });

  const organizationId = await getOrganizationId();

  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId, organizationId },
    select: { createdAt: true, userId: true },
  });

  if (!teacher) throw new Error('Teacher not found in your organization');

  await prisma.user.update({
    where: { id: teacher.userId },
    data: {
      profileImage: validatedData.profilePhoto,
      lastName: validatedData.lastName,
      firstName: validatedData.firstName,
      updatedAt: new Date(),
    },
  });

  if (!teacher) throw new Error('Teacher not found');

  if (existingProfile) {
    // ✅ Update profile
    await prisma.teacherProfile.update({
      where: { teacherId },
      data: {
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        dateOfBirth: validatedData.dateOfBirth,
        qualification: validatedData.qualification,
        experienceInYears: validatedData.experienceInYears,
        resumeUrl: validatedData.resumeUrl,
        bio: validatedData.bio,
        teachingPhilosophy: validatedData.teachingPhilosophy,
        specializedSubjects: validatedData.specializedSubjects,
        preferredGrades: validatedData.preferredGrades,
        idProofUrl: validatedData.idProofUrl || '',
        linkedinPortfolio: validatedData.linkedinPortfolio,
        languagesKnown: validatedData.languagesKnown,
        certificateUrls,
      },
    });
  } else {
    // ✅ Create profile using teacher.createdAt as joinedAt
    await prisma.teacherProfile.create({
      data: {
        teacherId,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        dateOfBirth: validatedData.dateOfBirth,
        qualification: validatedData.qualification,
        experienceInYears: validatedData.experienceInYears,
        resumeUrl: validatedData.resumeUrl,
        joinedAt: teacher.createdAt,
        bio: validatedData.bio,
        teachingPhilosophy: validatedData.teachingPhilosophy,
        specializedSubjects: validatedData.specializedSubjects,
        preferredGrades: validatedData.preferredGrades,
        idProofUrl: validatedData.idProofUrl || '',
        linkedinPortfolio: validatedData.linkedinPortfolio,
        languagesKnown: validatedData.languagesKnown,
        certificateUrls,
      },
    });
  }
}
export async function createTeacherFormAction(data: CreateTeacherFormData) {
  try {
    const organizationId = await getOrganizationId();
    const inviterUserId = await getCurrentUserId();
    const validatedData = createTeacherSchema.parse(data);

    await prisma.$transaction(async (tx) => {
      const teacherUser = await upsertUserRecord(tx, {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: validatedData.contactPhone,
        profileImage: null,
        role: Role.TEACHER,
        organizationId,
        createMembership: false,
      });

      const existingMembership = await tx.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: teacherUser.id,
            organizationId,
          },
        },
        select: {
          status: true,
        },
      });

      if (existingMembership?.status === 'ACTIVE') {
        throw new Error(`${validatedData.email.trim().toLowerCase()} is already an active member of this organization.`);
      }

      const teacher = await tx.teacher.upsert({
        where: { userId: teacherUser.id },
        update: {
          employeeCode: validatedData.employeeCode,
          employmentStatus: 'ACTIVE',
          organizationId,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          userId: teacherUser.id,
          employeeCode: validatedData.employeeCode,
          employmentStatus: 'ACTIVE',
          organizationId,
          isActive: true,
          createdAt: new Date(),
        },
      });

      await tx.teacherProfile.upsert({
        where: { teacherId: teacher.id },
        update: {
          idProofUrl: validatedData.idProofUrl || '',
          joinedAt: validatedData.joinedAt,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          dateOfBirth: validatedData.dateOfBirth,
          qualification: validatedData.qualification,
          experienceInYears: validatedData.experienceInYears,
          bio: validatedData.bio,
          teachingPhilosophy: validatedData.teachingPhilosophy,
          specializedSubjects: validatedData.specializedSubjects,
          preferredGrades: validatedData.preferredGrades,
          linkedinPortfolio: validatedData.linkedinPortfolio,
          languagesKnown: validatedData.languagesKnown,
        },
        create: {
          teacherId: teacher.id,
          idProofUrl: validatedData.idProofUrl || '',
          joinedAt: validatedData.joinedAt,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          dateOfBirth: validatedData.dateOfBirth,
          qualification: validatedData.qualification,
          experienceInYears: validatedData.experienceInYears,
          bio: validatedData.bio,
          teachingPhilosophy: validatedData.teachingPhilosophy,
          specializedSubjects: validatedData.specializedSubjects,
          preferredGrades: validatedData.preferredGrades,
          linkedinPortfolio: validatedData.linkedinPortfolio,
          languagesKnown: validatedData.languagesKnown,
        },
      });
    });

    await sendOrganizationRoleInvitation({
      email: validatedData.email,
      role: Role.TEACHER,
      organizationId,
      inviterUserId,
    });

    revalidatePath('/dashboard/teachers');
    return {
      success: true,
      message: `Teacher profile created and invitation sent to ${validatedData.email.trim().toLowerCase()}.`,
    };
  } catch (error: any) {
    console.error('Teacher creation failed:', error);
    return {
      success: false,
      error: extractErrorMessage(error),
    };
  }
}

export async function updateTeacherAction(
  teacherId: string,
  data: CreateTeacherFormData
) {
  try {
    const organizationId = await getOrganizationId();
    await prisma.teacher.update({
      where: { id: teacherId, organizationId },
      data: {
        employeeCode: data.employeeCode,
        user: {
          update: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          },
        },
        profile: {
          upsert: {
            create: {
              idProofUrl: data.idProofUrl || '',
              contactEmail: data.contactEmail,
              contactPhone: data.contactPhone,
              address: data.address,
              city: data.city,
              state: data.state,
              dateOfBirth: data.dateOfBirth,
              qualification: data.qualification,
              experienceInYears: data.experienceInYears,
              joinedAt: data.joinedAt,
              specializedSubjects: data.specializedSubjects,
              preferredGrades: data.preferredGrades,
              bio: data.bio,
              teachingPhilosophy: data.teachingPhilosophy,
              linkedinPortfolio: data.linkedinPortfolio,
              languagesKnown: data.languagesKnown,
            },
            update: {
              contactEmail: data.contactEmail,
              contactPhone: data.contactPhone,
              address: data.address,
              city: data.city,
              state: data.state,
              dateOfBirth: data.dateOfBirth,
              qualification: data.qualification,
              experienceInYears: data.experienceInYears,
              joinedAt: data.joinedAt,
              specializedSubjects: data.specializedSubjects,
              preferredGrades: data.preferredGrades,
              bio: data.bio,
              teachingPhilosophy: data.teachingPhilosophy,
              linkedinPortfolio: data.linkedinPortfolio,
              languagesKnown: data.languagesKnown,
            },
          },
        },
      },
    });
    revalidatePath('/dashboard/teachers');
    return { success: true };
  } catch (error) {
    console.error('Error updating teacher:', error);
    return { success: false, error: 'Failed to update teacher' };
  }
}

export async function onboardExistingTeacherAction(data: CreateTeacherFormData) {
  try {
    const organizationId = await getOrganizationId();
    const inviterUserId = await getCurrentUserId();
    const validatedData = createTeacherSchema.parse(data);

    // Find the existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        memberships: {
          where: { organizationId },
        },
      },
    });

    if (!existingUser) {
      throw new Error('User not found with this email');
    }

    const currentMembership = existingUser.memberships[0];

    await prisma.$transaction(async (tx) => {
      // 1. Update user membership role if needed (ensure they can at least be a teacher in this org)
      // If they are an ADMIN, we keep them as ADMIN but they now have a teacher profile
      if (!currentMembership || (currentMembership.role !== 'ADMIN' && currentMembership.role !== 'TEACHER')) {
        await tx.membership.upsert({
          where: {
            userId_organizationId: {
              userId: existingUser.id,
              organizationId,
            },
          },
          create: {
            userId: existingUser.id,
            organizationId,
            role: 'TEACHER',
            status: 'ACTIVE',
            acceptedAt: new Date(),
          },
          update: {
            role: 'TEACHER',
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        });
      }

      // 2. Upsert Teacher record
      await tx.teacher.upsert({
        where: { userId: existingUser.id },
        update: {
          employeeCode: validatedData.employeeCode,
          organizationId,
          isActive: true,
          profile: {
            upsert: {
              create: {
                idProofUrl: validatedData.idProofUrl || '',
                joinedAt: validatedData.joinedAt,
                contactEmail: validatedData.contactEmail,
                contactPhone: validatedData.contactPhone,
                address: validatedData.address,
                city: validatedData.city,
                state: validatedData.state,
                dateOfBirth: validatedData.dateOfBirth,
                qualification: validatedData.qualification,
                experienceInYears: validatedData.experienceInYears,
                bio: validatedData.bio,
                teachingPhilosophy: validatedData.teachingPhilosophy,
                specializedSubjects: validatedData.specializedSubjects,
                preferredGrades: validatedData.preferredGrades,
                linkedinPortfolio: validatedData.linkedinPortfolio,
                languagesKnown: validatedData.languagesKnown,
              },
              update: {
                idProofUrl: validatedData.idProofUrl || '',
                contactEmail: validatedData.contactEmail,
                contactPhone: validatedData.contactPhone,
                address: validatedData.address,
                city: validatedData.city,
                state: validatedData.state,
                dateOfBirth: validatedData.dateOfBirth,
                qualification: validatedData.qualification,
                experienceInYears: validatedData.experienceInYears,
                bio: validatedData.bio,
                teachingPhilosophy: validatedData.teachingPhilosophy,
                specializedSubjects: validatedData.specializedSubjects,
                preferredGrades: validatedData.preferredGrades,
                linkedinPortfolio: validatedData.linkedinPortfolio,
                languagesKnown: validatedData.languagesKnown,
              }
            },
          },
        },
        create: {
          userId: existingUser.id,
          employeeCode: validatedData.employeeCode,
          employmentStatus: 'ACTIVE',
          organizationId,
          isActive: true,
          createdAt: new Date(),
          profile: {
            create: {
              idProofUrl: validatedData.idProofUrl || '',
              joinedAt: validatedData.joinedAt,
              contactEmail: validatedData.contactEmail,
              contactPhone: validatedData.contactPhone,
              address: validatedData.address,
              city: validatedData.city,
              state: validatedData.state,
              dateOfBirth: validatedData.dateOfBirth,
              qualification: validatedData.qualification,
              experienceInYears: validatedData.experienceInYears,
              bio: validatedData.bio,
              teachingPhilosophy: validatedData.teachingPhilosophy,
              specializedSubjects: validatedData.specializedSubjects,
              preferredGrades: validatedData.preferredGrades,
              linkedinPortfolio: validatedData.linkedinPortfolio,
              languagesKnown: validatedData.languagesKnown,
            },
          },
        },
      });
    });

    const inviteResult = await sendOrganizationRoleInvitation({
      email: validatedData.email,
      role: Role.TEACHER,
      organizationId,
      inviterUserId,
      skipIfActive: true,
    });

    revalidatePath('/dashboard/teachers');
    return {
      success: true,
      message: inviteResult.sent
        ? `Teacher profile updated and invitation sent to ${validatedData.email.trim().toLowerCase()}.`
        : 'Teacher profile updated. This user is already a member of the organization.',
    };
  } catch (error: any) {
    console.error('Teacher onboarding failed:', error);
    return { success: false, error: error.message || 'Failed to onboard teacher' };
  }
}
export async function toggleTeacherStatus(teacherId: string) {
  const organizationId = await getOrganizationId();
  // First get the current status
  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId, organizationId },
    select: { isActive: true },
  });

  if (!teacher) {
    throw new Error('Teacher not found in your organization');
  }

  // Toggle the status
  await prisma.teacher.update({
    where: { id: teacherId, organizationId },
    data: {
      isActive: !teacher.isActive,
    },
  });

  revalidatePath('/dashboard/teachers');

  console.log('Teacher status toggled');
}

export async function createAcademicYear(data: AcademicYearFormData) {
  try {
    const organizationId = await getOrganizationId();
    const user = await getCurrentUser();
    const userId = await getCurrentUserId();

    const validatedData = academicYearSchema.parse(data);
    // Check for overlapping academic years
    const overlapping = await prisma.academicYear.findFirst({
      where: {
        organizationId,
        OR: [
          {
            AND: [
              { startDate: { lte: validatedData.startDate } },
              { endDate: { gte: validatedData.startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: validatedData.endDate } },
              { endDate: { gte: validatedData.endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: validatedData.startDate } },
              { endDate: { lte: validatedData.endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return {
        success: false,
        error:
          'The selected dates overlap with an existing academic year. Please choose different dates.',
      };
    }

    // If this is set as current, or if it's the first one, ensure it's marked current
    const count = await prisma.academicYear.count({ where: { organizationId } });
    const isActuallyCurrent = validatedData.isCurrent || count === 0;

    if (isActuallyCurrent) {
      await prisma.academicYear.updateMany({
        where: {
          organizationId: organizationId,
          isCurrent: true,
        },
        data: { isCurrent: false },
      });
    }

    await prisma.academicYear.create({
      data: {
        ...validatedData,
        isCurrent: isActuallyCurrent,
        organizationId, // Force the organizationId from session
        createdBy:
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          userId ||
          'SYSTEM',
      },
    });

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error) {
    console.error('Academic year creation error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }
    return {
      success: false,
      error:
        'Something went wrong while creating the academic year. Please try again or contact support.',
    };
  }
}

export async function updateAcademicYear(data: AcademicYearUpdateFormData) {
  try {
    const organizationId = await getOrganizationId();
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'You do not have permission to perform this action. Only Admin can perform this action.',
      };
    }
    const validatedData = academicYearUpdateSchema.parse(data);

    // Check for overlapping academic years (excluding current one)
    const overlapping = await prisma.academicYear.findFirst({
      where: {
        organizationId,
        id: { not: validatedData.id },
        OR: [
          {
            AND: [
              { startDate: { lte: validatedData.startDate } },
              { endDate: { gte: validatedData.startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: validatedData.endDate } },
              { endDate: { gte: validatedData.endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: validatedData.startDate } },
              { endDate: { lte: validatedData.endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return {
        success: false,
        error:
          'The selected dates overlap with an existing academic year. Please choose different dates.',
      };
    }

    const currentYear = await prisma.academicYear.findUnique({
      where: { id: validatedData.id },
      select: { isCurrent: true },
    });

    // If trying to unmark the current year, ensure another one exists
    if (!validatedData.isCurrent && currentYear?.isCurrent) {
      const otherCurrent = await prisma.academicYear.findFirst({
        where: {
          organizationId,
          isCurrent: true,
          id: { not: validatedData.id },
        },
      });
      if (!otherCurrent) {
        return {
          success: false,
          error:
            'You must have at least one current academic year. Mark another year as current first.',
        };
      }
    }

    // If this is set as current, unset other currents
    if (validatedData.isCurrent) {
      await prisma.academicYear.updateMany({
        where: {
          organizationId: validatedData.organizationId,
          isCurrent: true,
          id: { not: validatedData.id },
        },
        data: { isCurrent: false },
      });
    }

    await prisma.academicYear.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        type: validatedData.type,
        description: validatedData.description,
        isCurrent: validatedData.isCurrent,
      },
    });

    revalidatePath('/dashboard/settings');

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }
    return {
      success: false,
      error:
        'Something went wrong while updating the academic year. Please try again or contact support.',
    };
  }
}

export async function setCurrentAcademicYear(
  yearId: string
) {
  try {
    const organizationId = await getOrganizationId();
    // Check Admin Only
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'You do not have permission to perform this action. Only Admin can perform this action.',
      };
    }
    // Unset all other currents
    await prisma.academicYear.updateMany({
      where: {
        organizationId,
        isCurrent: true,
        id: { not: yearId },
      },
      data: {
        isCurrent: false,
      },
    });

    // Set selected year as current
    await prisma.academicYear.update({
      where: {
        id: yearId,
      },
      data: {
        isCurrent: true,
      },
    });

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to set current academic year:', error);
    return {
      success: false,
      error: 'Unable to set currents academic year',
    };
  }
}

export async function deleteAcademicYear(id: string) {
  const organizationId = await getOrganizationId();
  try {
    await prisma.academicYear.delete({
      where: { id, organizationId },
    });

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete academic year:', error);

    let errorMessage = 'Failed to delete academic year';

    // Check for Prisma foreign key error
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'P2003'
    ) {
      errorMessage =
        'Cannot delete. This academic year is linked to other data (e.g., attendance, notices, etc.)';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function submitSupportForm(data: SupportFormData) {
  const submission = {
    ...data,
    id: Date.now().toString(), // simple unique ID
    createdAt: new Date().toISOString(),
  };

  // Append to a Redis list
  await redis.rpush('support-submissions', JSON.stringify(submission));

  return { success: true, submission };
}
